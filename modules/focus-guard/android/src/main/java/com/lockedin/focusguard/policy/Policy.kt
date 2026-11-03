package com.lockedin.focusguard.policy

import org.json.JSONObject

enum class FilterId(val key: String) {
  INSTAGRAM_REELS("instagramReels"),
  INSTAGRAM_EXPLORE("instagramExplore"),
  YOUTUBE_SHORTS("youtubeShorts"),
}

enum class BlockLevel(val key: String) {
  SOFT("soft"),
  FIRM("firm"),
  STRICT("strict");

  companion object {
    fun fromKey(key: String): BlockLevel? = entries.firstOrNull { it.key == key }
  }
}

data class SessionPolicy(
  val endsAt: Long,
  val level: BlockLevel,
  val blockedPackages: Set<String>,
) {
  fun isActive(now: Long): Boolean = now < endsAt
}

/** Mirror of the JS `BlockingPolicy`. Written by the app, read by the accessibility service. */
data class Policy(
  val enabledFilters: Set<FilterId>,
  val session: SessionPolicy?,
) {
  fun activeSession(now: Long): SessionPolicy? = session?.takeIf { it.isActive(now) }

  companion object {
    val EMPTY = Policy(enabledFilters = emptySet(), session = null)

    /** Throws [IllegalArgumentException] when the JSON does not match the contract. */
    fun parse(json: String): Policy {
      val root = try {
        JSONObject(json)
      } catch (error: Exception) {
        throw IllegalArgumentException("Policy is not valid JSON", error)
      }
      val filters = root.optJSONObject("filters") ?: throw IllegalArgumentException("Policy has no filters")
      val enabled = FilterId.entries.filter { filters.optBoolean(it.key, false) }.toSet()
      return Policy(enabledFilters = enabled, session = parseSession(root.optJSONObject("session")))
    }

    private fun parseSession(session: JSONObject?): SessionPolicy? {
      if (session == null) return null
      val level = BlockLevel.fromKey(session.optString("level"))
        ?: throw IllegalArgumentException("Unknown block level")
      val endsAt = session.optLong("endsAt", -1)
      if (endsAt <= 0) throw IllegalArgumentException("Session has no end time")
      val packages = session.optJSONArray("blockedPackages")
      val blocked = buildSet {
        if (packages != null) for (index in 0 until packages.length()) add(packages.getString(index))
      }
      return SessionPolicy(endsAt = endsAt, level = level, blockedPackages = blocked)
    }
  }
}
