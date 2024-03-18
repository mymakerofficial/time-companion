import {useDialogStore} from "@renderer/stores/dialogStore";
import {h} from "vue";
import ErrorDialog from "@renderer/components/common/dialog/ErrorDialog.vue";
import {isDefined} from "@renderer/lib/utils";

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