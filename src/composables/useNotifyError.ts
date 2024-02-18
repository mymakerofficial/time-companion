import {useDialogStore} from "@/stores/dialogStore";
import type {Component} from "vue";
import {h} from "vue";
import ErrorDialog from "@/components/common/dialog/ErrorDialog.vue";
import {isDefined} from "@/lib/utils";

export interface ErrorProps {
  title: string
  message: string
  error?: Error
  actions?: {
    label: string
    handler: () => void
  }[]
}

export function useNotifyError(props: any) {
  const dialogStore = useDialogStore()

  dialogStore.openDialog(h(ErrorDialog, {
    actions: [{
      label: 'Confirm',
      handler: () => {},
    }],
    ...props
  }))

  if (isDefined(props.error)) {
    console.error(props.error)
  }
}