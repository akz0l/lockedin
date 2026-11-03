package com.lockedin.focusguard

import com.lockedin.focusguard.detection.Decision
import com.lockedin.focusguard.detection.Enforcer
import com.lockedin.focusguard.detection.EventKind
import com.lockedin.focusguard.detection.INSTAGRAM
import com.lockedin.focusguard.detection.ScreenSnapshot
import com.lockedin.focusguard.detection.YOUTUBE
import com.lockedin.focusguard.policy.BlockLevel
import com.lockedin.focusguard.policy.FilterId
import com.lockedin.focusguard.policy.Policy
import com.lockedin.focusguard.policy.SessionPolicy
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class EnforcerTest {
  private val own = "com.lockedin.app"
  private val now = 1_000_000L
  private val allFilters = Policy(FilterId.entries.toSet(), session = null)
  private val tiktok = "com.zhiliaoapp.musically"

  private fun decide(screen: ScreenSnapshot, policy: Policy = allFilters) =
    Enforcer.decide(screen, policy, now, own, "LockedIn")

  private fun session(level: BlockLevel, endsAt: Long = now + 60_000) =
    allFilters.copy(session = SessionPolicy(endsAt, level, setOf(tiktok)))

  @Test
  fun `leaves the Instagram Reels viewer`() {
    val screen = ScreenSnapshot(INSTAGRAM, EventKind.CONTENT_CHANGED, setOf("clips_viewer_view_pager", "clips_tab"))
    assertEquals(Decision.LeaveFeature(FilterId.INSTAGRAM_REELS), decide(screen))
  }

  @Test
  fun `keeps the Instagram feed and chats usable`() {
    val feed = ScreenSnapshot(INSTAGRAM, EventKind.SCROLLED, setOf("feed_tab", "clips_tab", "direct_tab"))
    val chat = ScreenSnapshot(INSTAGRAM, EventKind.CONTENT_CHANGED, setOf("direct_thread_header", "row_thread_composer_edittext"))
    assertEquals(Decision.None, decide(feed))
    assertEquals(Decision.None, decide(chat))
  }

  @Test
  fun `leaves Explore only when the grid is scrolled`() {
    val grid = setOf("search_tab", "image_preview")
    assertEquals(Decision.None, decide(ScreenSnapshot(INSTAGRAM, EventKind.WINDOW_CHANGED, grid)))
    assertEquals(
      Decision.LeaveFeature(FilterId.INSTAGRAM_EXPLORE),
      decide(ScreenSnapshot(INSTAGRAM, EventKind.SCROLLED, grid)),
    )
  }

  @Test
  fun `does not treat a profile grid as Explore`() {
    val profile = ScreenSnapshot(INSTAGRAM, EventKind.SCROLLED, setOf("image_preview", "profile_viewpager"))
    assertEquals(Decision.None, decide(profile))
  }

  @Test
  fun `leaves the YouTube Shorts player but not the home feed`() {
    val shorts = ScreenSnapshot(YOUTUBE, EventKind.CONTENT_CHANGED, setOf("reel_player_page_container"))
    val home = ScreenSnapshot(YOUTUBE, EventKind.SCROLLED, setOf("reel_recycler", "results"))
    assertEquals(Decision.LeaveFeature(FilterId.YOUTUBE_SHORTS), decide(shorts))
    assertEquals(Decision.None, decide(home))
  }

  @Test
  fun `a disabled filter does nothing`() {
    val screen = ScreenSnapshot(INSTAGRAM, EventKind.CONTENT_CHANGED, setOf("clips_viewer_view_pager"))
    val policy = Policy(setOf(FilterId.YOUTUBE_SHORTS), session = null)
    assertEquals(Decision.None, decide(screen, policy))
  }

  @Test
  fun `blocks a session app until the session ends`() {
    val screen = ScreenSnapshot(tiktok, EventKind.WINDOW_CHANGED)
    assertEquals(Decision.BlockApp(tiktok), decide(screen, session(BlockLevel.SOFT)))
    assertEquals(Decision.None, decide(screen, session(BlockLevel.SOFT, endsAt = now)))
  }

  @Test
  fun `names a blocked app from the event alone, before any window is read`() {
    assertEquals(tiktok, Enforcer.blockedApp(tiktok, session(BlockLevel.FIRM), now, own))
    assertEquals(null, Enforcer.blockedApp(INSTAGRAM, session(BlockLevel.FIRM), now, own))
    assertEquals(null, Enforcer.blockedApp(tiktok, session(BlockLevel.FIRM, endsAt = now), now, own))
    assertEquals(null, Enforcer.blockedApp(own, allFilters.copy(session = SessionPolicy(now + 1, BlockLevel.SOFT, setOf(own))), now, own))
  }

  @Test
  fun `strict sessions guard settings screens that mention LockedIn`() {
    val settings = ScreenSnapshot("com.android.settings", EventKind.WINDOW_CHANGED, texts = listOf("Accessibility", "LockedIn"))
    val wifi = ScreenSnapshot("com.android.settings", EventKind.WINDOW_CHANGED, texts = listOf("Wi-Fi"))
    assertEquals(Decision.GuardSettings, decide(settings, session(BlockLevel.STRICT)))
    assertEquals(Decision.None, decide(wifi, session(BlockLevel.STRICT)))
    assertEquals(Decision.None, decide(settings, session(BlockLevel.FIRM)))
  }

  @Test
  fun `never acts on LockedIn itself`() {
    val screen = ScreenSnapshot(own, EventKind.WINDOW_CHANGED, setOf("clips_viewer_view_pager"))
    assertEquals(Decision.None, decide(screen, session(BlockLevel.STRICT)))
    assertFalse(Enforcer.needsInspection(own, session(BlockLevel.STRICT), now, own))
  }

  @Test
  fun `only inspects packages a rule can apply to`() {
    assertTrue(Enforcer.needsInspection(INSTAGRAM, allFilters, now, own))
    assertFalse(Enforcer.needsInspection("com.whatsapp", allFilters, now, own))
    assertTrue(Enforcer.needsInspection(tiktok, session(BlockLevel.SOFT), now, own))
    assertTrue(Enforcer.needsInspection("com.android.settings", session(BlockLevel.STRICT), now, own))
    assertFalse(Enforcer.needsInspection("com.android.settings", session(BlockLevel.FIRM), now, own))
  }

  @Test
  fun `only inspects an app whose own filter is on`() {
    val shortsOnly = Policy(setOf(FilterId.YOUTUBE_SHORTS), session = null)
    assertTrue(Enforcer.needsInspection(YOUTUBE, shortsOnly, now, own))
    assertFalse(Enforcer.needsInspection(INSTAGRAM, shortsOnly, now, own))
  }
}
