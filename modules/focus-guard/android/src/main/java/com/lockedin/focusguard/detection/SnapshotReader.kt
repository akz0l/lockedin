package com.lockedin.focusguard.detection

import android.os.Build
import android.view.accessibility.AccessibilityNodeInfo

object SnapshotReader {
  private const val MAX_NODES = 600
  private const val MAX_DEPTH = 40

  fun read(root: AccessibilityNodeInfo, packageName: String, event: EventKind, collectTexts: Boolean): ScreenSnapshot {
    val ids = HashSet<String>()
    val texts = ArrayList<String>()
    var visited = 0

    fun visit(node: AccessibilityNodeInfo, depth: Int) {
      if (visited >= MAX_NODES || depth > MAX_DEPTH) return
      visited++
      if (node.isVisibleToUser) {
        node.viewIdResourceName?.substringAfter(":id/")?.let(ids::add)
        if (collectTexts) {
          node.text?.toString()?.let(texts::add)
          node.contentDescription?.toString()?.let(texts::add)
        }
      }
      for (index in 0 until node.childCount) {
        val child = node.getChild(index) ?: continue
        visit(child, depth + 1)
        @Suppress("DEPRECATION")
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) child.recycle()
      }
    }

    visit(root, 0)
    return ScreenSnapshot(packageName, event, ids, texts)
  }
}
