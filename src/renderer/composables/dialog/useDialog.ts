import { createGlobalState, whenever } from '@vueuse/core'
import {
  type AllowedComponentProps,
  computed,
  h,
  inject,
  provide,
  reactive,
  ref,
} from 'vue'
import type { VNode } from '@vue/runtime-dom'
import type { Component, VNodeProps } from '@vue/runtime-core'
import { uuid } from '@shared/lib/utils/uuid'
import type { Nullable } from '@shared/lib/utils/types'
import { isNotNull } from '@shared/lib/utils/checks'
import { entriesOf } from '@shared/lib/utils/object'

export const useDialogState = createGlobalState(() => {
  const dialogs = reactive<Record<string, VNode>>({})

  function addDialog(id: string, dialog: VNode) {
    dialogs[id] = dialog
  }

  function disposeDialog(id: string) {
    delete dialogs[id]
  }

  return {
    dialogs: computed(() => entriesOf(dialogs)),
    addDialog,
    disposeDialog,
  }
})

type ComponentProps<TComponent extends Component> = TComponent extends new (
  ...args: any
) => any
  ? Omit<
      InstanceType<TComponent>['$props'],
      keyof VNodeProps | keyof AllowedComponentProps
    >
  : never

export function useDialog<TComponent extends Component>(component: TComponent) {
  const { addDialog } = useDialogState()

  function open(props?: ComponentProps<TComponent>) {
    addDialog(uuid(), h(component, props))
  }

  return {
    open,
  }
}

export function useProvedDialogContext(key: string) {
  provide('__dialog_context_id__', key)
}

export function useDialogContext() {
  const id = inject<Nullable<string>>('__dialog_context_id__', null)
  const { disposeDialog } = useDialogState()

  const open = ref(isNotNull(id))

  whenever(
    () => !open.value,
    () => {
      // TODO race condition incoming
      setTimeout(() => {
        disposeDialog(id!)
      }, 200)
    },
  )

  function close() {
    open.value = false
  }

  return {
    open,
    close,
  }
}
