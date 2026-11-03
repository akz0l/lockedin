package com.lockedin.focusguard

import android.accessibilityservice.AccessibilityService
import android.os.Build
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast
import com.lockedin.focusguard.detection.Decision
import com.lockedin.focusguard.detection.Enforcer
import com.lockedin.focusguard.detection.EventKind
import com.lockedin.focusguard.detection.GUARDED_PACKAGES
import com.lockedin.focusguard.detection.SnapshotReader
import com.lockedin.focusguard.policy.FilterId
import com.lockedin.focusguard.policy.PolicyStore

class FocusAccessibilityService : AccessibilityService() {
  private lateinit var store: PolicyStore
  private lateinit var ownLabel: String
  private var lastActionAt = 0L

  override fun onServiceConnected() {
    store = PolicyStore(this)
    ownLabel = applicationInfo.loadLabel(packageManager).toString()
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent) {
    if (!::store.isInitialized) return
    val eventPackage = event.packageName?.toString() ?: return
    val now = System.currentTimeMillis()
    val policy = store.current()
    if (!Enforcer.needsInspection(eventPackage, policy, now, packageName)) return
    if (now - lastActionAt < DEBOUNCE_MS) return

    Enforcer.blockedApp(eventPackage, policy, now, packageName)?.let { blocked ->
      blockApp(blocked)
      lastActionAt = now
      return
    }

    val kind = when (event.eventType) {
      AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> EventKind.WINDOW_CHANGED
      AccessibilityEvent.TYPE_VIEW_SCROLLED -> EventKind.SCROLLED
      else -> EventKind.CONTENT_CHANGED
    }
    val root = rootInActiveWindow ?: return
    val screenPackage = root.packageName?.toString() ?: eventPackage
    val screen = SnapshotReader.read(root, screenPackage, kind, collectTexts = screenPackage in GUARDED_PACKAGES)
    @Suppress("DEPRECATION")
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) root.recycle()

    when (val decision = Enforcer.decide(screen, policy, now, packageName, ownLabel)) {
      Decision.None -> return
      is Decision.LeaveFeature -> {
        performGlobalAction(GLOBAL_ACTION_BACK)
        toast("${featureName(decision.filter)} are off in $ownLabel")
      }
      is Decision.BlockApp -> blockApp(decision.packageName)
      Decision.GuardSettings -> {
        performGlobalAction(GLOBAL_ACTION_HOME)
        toast("Strict session: settings for $ownLabel are locked")
      }
    }
    lastActionAt = now
  }

  override fun onInterrupt() = Unit

  private fun blockApp(blockedPackage: String) {
    performGlobalAction(GLOBAL_ACTION_HOME)
    startActivity(BlockActivity.intent(this, blockedPackage))
  }

  private fun toast(message: String) = Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()

  private fun featureName(filter: FilterId) = when (filter) {
    FilterId.INSTAGRAM_REELS -> "Reels"
    FilterId.INSTAGRAM_EXPLORE -> "Explore posts"
    FilterId.YOUTUBE_SHORTS -> "Shorts"
  }

  private companion object {
    /** One back press per screen; Instagram and YouTube emit bursts of content events. */
    const val DEBOUNCE_MS = 1_200L
  }
}
