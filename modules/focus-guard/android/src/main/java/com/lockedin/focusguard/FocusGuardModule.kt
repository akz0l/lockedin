package com.lockedin.focusguard

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.lockedin.focusguard.policy.PolicyStore

class FocusGuardModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("FocusGuard")

    AsyncFunction("applyPolicy") { json: String ->
      try {
        PolicyStore(context).save(json)
      } catch (error: IllegalArgumentException) {
        throw CodedException("ERR_INVALID_POLICY", error.message, error)
      }
    }

    AsyncFunction("getStatus") {
      mapOf(
        "serviceEnabled" to isServiceEnabled(context),
        "ignoringBatteryOptimizations" to isIgnoringBatteryOptimizations(context),
      )
    }

    AsyncFunction("openAccessibilitySettings") {
      context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    AsyncFunction("openBatteryOptimizationSettings") {
      context.startActivity(
        Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }

    AsyncFunction("listLaunchableApps") {
      val pm = context.packageManager
      val launcher = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      pm.queryIntentActivities(launcher, 0)
        .map { it.activityInfo.packageName to it.loadLabel(pm).toString() }
        .filter { (packageName, _) -> packageName != context.packageName }
        .distinctBy { (packageName, _) -> packageName }
        .sortedBy { (_, label) -> label.lowercase() }
        .map { (packageName, label) -> mapOf("packageName" to packageName, "label" to label) }
    }
  }

  private fun isServiceEnabled(context: Context): Boolean {
    val expected = ComponentName(context, FocusAccessibilityService::class.java)
    val enabled = Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
      ?: return false
    return enabled.split(':').any { ComponentName.unflattenFromString(it) == expected }
  }

  private fun isIgnoringBatteryOptimizations(context: Context): Boolean {
    val power = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    return power.isIgnoringBatteryOptimizations(context.packageName)
  }
}
