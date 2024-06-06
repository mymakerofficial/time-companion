import type { Component } from 'vue'
import { useDialog } from '@renderer/composables/dialog/useDialog'

/***
 * @deprecated
 */
export function useOpenDialog(component: Component) {
  useDialog(component).open()
}
