package com.lockedin.focusguard

import com.lockedin.focusguard.policy.BlockLevel
import com.lockedin.focusguard.policy.FilterId
import com.lockedin.focusguard.policy.Policy
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class PolicyTest {
  @Test
  fun `parses the policy the app sends`() {
    val policy = Policy.parse(
      """
      {"filters":{"instagramReels":true,"instagramExplore":false,"youtubeShorts":true},
       "session":{"endsAt":1700000000000,"level":"strict","blockedPackages":["com.zhiliaoapp.musically"],"exitRequestedAt":null}}
      """.trimIndent(),
    )
    assertEquals(setOf(FilterId.INSTAGRAM_REELS, FilterId.YOUTUBE_SHORTS), policy.enabledFilters)
    assertEquals(BlockLevel.STRICT, policy.session?.level)
    assertEquals(1_700_000_000_000L, policy.session?.endsAt)
    assertEquals(setOf("com.zhiliaoapp.musically"), policy.session?.blockedPackages)
  }

  @Test
  fun `a null session means no session`() {
    val policy = Policy.parse("""{"filters":{"instagramReels":true},"session":null}""")
    assertNull(policy.session)
  }

  @Test(expected = IllegalArgumentException::class)
  fun `rejects malformed json`() {
    Policy.parse("{not json")
  }

  @Test(expected = IllegalArgumentException::class)
  fun `rejects an unknown level`() {
    Policy.parse("""{"filters":{},"session":{"endsAt":1,"level":"extreme","blockedPackages":[]}}""")
  }

  @Test(expected = IllegalArgumentException::class)
  fun `rejects a blocked entry that is not a package name`() {
    Policy.parse("""{"filters":{},"session":{"endsAt":1,"level":"soft","blockedPackages":["not a package"]}}""")
  }
}
