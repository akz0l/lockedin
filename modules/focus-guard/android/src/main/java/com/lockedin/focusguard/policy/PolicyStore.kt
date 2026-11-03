package com.lockedin.focusguard.policy

import android.content.Context

/** Persists the policy so the service keeps enforcing it while the app is closed. */
class PolicyStore(context: Context) {
  private val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  private var cachedRaw: String? = null
  private var cached: Policy = Policy.EMPTY

  /** Validates before writing so a broken payload never replaces a working policy. */
  fun save(json: String) {
    val policy = Policy.parse(json)
    prefs.edit().putString(KEY_POLICY, json).apply()
    synchronized(this) {
      cachedRaw = json
      cached = policy
    }
  }

  fun current(): Policy {
    val raw = prefs.getString(KEY_POLICY, null) ?: return Policy.EMPTY
    synchronized(this) {
      if (raw != cachedRaw) {
        cached = runCatching { Policy.parse(raw) }.getOrDefault(Policy.EMPTY)
        cachedRaw = raw
      }
      return cached
    }
  }

  private companion object {
    const val PREFS_NAME = "com.lockedin.focusguard.policy"
    const val KEY_POLICY = "policy"
  }
}
