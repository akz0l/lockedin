package com.lockedin.focusguard.detection

import com.lockedin.focusguard.policy.BlockLevel
import com.lockedin.focusguard.policy.FilterId
import com.lockedin.focusguard.policy.Policy

sealed interface Decision {
  data object None : Decision
  data class LeaveFeature(val filter: FilterId) : Decision
  data class BlockApp(val packageName: String) : Decision
  /** Strict session: the user reached a screen that could disable LockedIn. */
  data object GuardSettings : Decision
}

object Enforcer {
  /** Cheap pre-check so the service only reads the window tree when a rule could apply. */
  fun needsInspection(packageName: String, policy: Policy, now: Long, ownPackage: String): Boolean {
    if (packageName == ownPackage) return false
    val session = policy.activeSession(now)
    if (session != null) {
      if (packageName in session.blockedPackages) return true
      if (session.level == BlockLevel.STRICT && packageName in GUARDED_PACKAGES) return true
    }
    return policy.enabledFilters.isNotEmpty() && packageName in FILTERED_PACKAGES
  }

  fun decide(screen: ScreenSnapshot, policy: Policy, now: Long, ownPackage: String, ownLabel: String): Decision {
    if (screen.packageName == ownPackage) return Decision.None

    val session = policy.activeSession(now)
    if (session != null) {
      if (screen.packageName in session.blockedPackages) return Decision.BlockApp(screen.packageName)
      if (session.level == BlockLevel.STRICT && isGuardedScreen(screen, ownLabel)) return Decision.GuardSettings
    }

    val rule = FILTER_RULES.firstOrNull { it.filter in policy.enabledFilters && it.matches(screen) }
    return rule?.let { Decision.LeaveFeature(it.filter) } ?: Decision.None
  }

  private fun isGuardedScreen(screen: ScreenSnapshot, ownLabel: String): Boolean =
    screen.packageName in GUARDED_PACKAGES && screen.texts.any { it.contains(ownLabel, ignoreCase = true) }
}
