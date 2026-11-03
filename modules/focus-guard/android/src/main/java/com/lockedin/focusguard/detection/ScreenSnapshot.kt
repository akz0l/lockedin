package com.lockedin.focusguard.detection

enum class EventKind { WINDOW_CHANGED, CONTENT_CHANGED, SCROLLED }

/**
 * What the service saw on screen. View ids are stored without their package prefix
 * ("com.instagram.android:id/clips_tab" becomes "clips_tab"). Texts are only collected
 * for guarded system screens, never inside social apps.
 */
data class ScreenSnapshot(
  val packageName: String,
  val event: EventKind,
  val viewIds: Set<String> = emptySet(),
  val texts: List<String> = emptyList(),
)
