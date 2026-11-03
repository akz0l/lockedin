package com.lockedin.focusguard

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.text.format.DateFormat
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.window.OnBackInvokedDispatcher
import com.lockedin.focusguard.policy.BlockLevel
import com.lockedin.focusguard.policy.PolicyStore
import java.util.Date

/** Full-screen block shown when a session app is opened. Back and "Go home" both leave to the launcher. */
class BlockActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val session = PolicyStore(this).current().activeSession(System.currentTimeMillis())
    if (session == null) {
      finish()
      return
    }

    val blockedLabel = intent.getStringExtra(EXTRA_PACKAGE)?.let(::appLabel) ?: "This app"
    val until = DateFormat.getTimeFormat(this).format(Date(session.endsAt))
    val levelLine = when (session.level) {
      BlockLevel.SOFT -> "Soft: you can end the session in LockedIn after a 10-second pause."
      BlockLevel.FIRM -> "Firm: you can end the session in LockedIn after a 5-minute wait."
      BlockLevel.STRICT -> "Strict: this session can't be ended early."
    }

    setContentView(
      LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        gravity = Gravity.CENTER_VERTICAL
        setBackgroundColor(Color.BLACK)
        setPadding(dp(24), dp(48), dp(24), dp(48))
        addView(text("Locked in", 34f, PRIMARY, bold = true))
        addView(spacer(12))
        addView(text("$blockedLabel is blocked until $until.", 17f, PRIMARY))
        addView(spacer(8))
        addView(text(levelLine, 15f, SECONDARY))
        addView(spacer(40))
        addView(button("Go to home screen", filled = true) { goHome() })
        addView(spacer(12))
        addView(button("Open LockedIn", filled = false) { openLockedIn() })
      },
    )

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      onBackInvokedDispatcher.registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT) { goHome() }
    }
  }

  @Deprecated("Handled by OnBackInvokedDispatcher on Android 13+")
  override fun onBackPressed() = goHome()

  private fun goHome() {
    startActivity(Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    finish()
  }

  private fun openLockedIn() {
    packageManager.getLaunchIntentForPackage(packageName)?.let {
      startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    finish()
  }

  private fun appLabel(packageName: String): String? = runCatching {
    packageManager.getApplicationLabel(packageManager.getApplicationInfo(packageName, 0)).toString()
  }.getOrNull()

  private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()

  private fun spacer(heightDp: Int) = View(this).apply {
    layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(heightDp))
  }

  private fun text(value: String, sizeSp: Float, color: Int, bold: Boolean = false) = TextView(this).apply {
    text = value
    setTextColor(color)
    setTextSize(TypedValue.COMPLEX_UNIT_SP, sizeSp)
    if (bold) typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
  }

  private fun button(label: String, filled: Boolean, onClick: () -> Unit) = Button(this).apply {
    text = label
    isAllCaps = false
    minHeight = dp(52)
    setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
    setTextColor(if (filled) Color.BLACK else PRIMARY)
    background = GradientDrawable().apply {
      cornerRadius = dp(12).toFloat()
      if (filled) setColor(PRIMARY) else setStroke(dp(1), HAIRLINE)
    }
    stateListAnimator = null
    setOnClickListener { onClick() }
  }

  companion object {
    private const val EXTRA_PACKAGE = "blockedPackage"
    private val PRIMARY = Color.parseColor("#EDEDED")
    private val SECONDARY = Color.parseColor("#A1A1A1")
    private val HAIRLINE = Color.parseColor("#262626")

    fun intent(context: Context, blockedPackage: String): Intent =
      Intent(context, BlockActivity::class.java)
        .putExtra(EXTRA_PACKAGE, blockedPackage)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION)
  }
}
