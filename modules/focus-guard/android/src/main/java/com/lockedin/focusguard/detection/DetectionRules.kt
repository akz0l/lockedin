package com.lockedin.focusguard.detection

import com.lockedin.focusguard.policy.FilterId

/**
 * A screen matches when any of [anyOf] is visible and none of [noneOf] is.
 * [onlyOnScroll] keeps a screen usable until the user starts scrolling it.
 */
data class FilterRule(
  val filter: FilterId,
  val packageName: String,
  val anyOf: Set<String>,
  val noneOf: Set<String> = emptySet(),
  val onlyOnScroll: Boolean = false,
) {
  fun matches(screen: ScreenSnapshot): Boolean =
    screen.packageName == packageName &&
      (!onlyOnScroll || screen.event == EventKind.SCROLLED) &&
      screen.viewIds.any { it in anyOf } &&
      screen.viewIds.none { it in noneOf }
}

const val INSTAGRAM = "com.instagram.android"
const val YOUTUBE = "com.google.android.youtube"

/**
 * View ids change with app updates. Verify on a device with
 * `adb shell uiautomator dump && adb pull /sdcard/window_dump.xml` and update this table.
 * Sources: Instagram 451-453 (Scrollhalt, Reel Block), YouTube player ids (appblock, short-video-rules).
 */
val FILTER_RULES: List<FilterRule> = listOf(
  // Instagram calls Reels "clips"; the same viewer opens from the tab, the feed, Explore and chats.
  FilterRule(FilterId.INSTAGRAM_REELS, INSTAGRAM, anyOf = setOf("clips_viewer_view_pager")),
  // Explore grid cells live on the Search tab; scrolling the grid is the trigger so search still works.
  FilterRule(
    FilterId.INSTAGRAM_EXPLORE,
    INSTAGRAM,
    anyOf = setOf("image_preview"),
    noneOf = setOf("profile_viewpager", "profile_tab_layout", "direct_thread_header"),
    onlyOnScroll = true,
  ),
  // YouTube calls Shorts "reels"; these are player ids, not the home-feed Shorts shelf.
  FilterRule(
    FilterId.YOUTUBE_SHORTS,
    YOUTUBE,
    anyOf = setOf("reel_player_page_container", "reel_watch_fragment_root", "reel_watch_player"),
  ),
)

/** System screens that could disable or uninstall LockedIn. */
val GUARDED_PACKAGES: Set<String> = setOf(
  "com.android.settings",
  "com.google.android.packageinstaller",
  "com.android.packageinstaller",
  "com.samsung.android.packageinstaller",
  "com.miui.securitycenter",
)
