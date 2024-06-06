import ErrorDialog from '@renderer/components/common/dialog/ErrorDialog.vue'
import { isDefined } from '@renderer/lib/utils'
import { useDialog } from '@renderer/composables/dialog/useDialog'

export interface ErrorProps {
  title: string
  message: string
  error?: Error
  actions?: {
    label: string
    handler: () => void
  }[]
}

const { open: openErrorDialog } = useDialog(ErrorDialog)

/***
 * @deprecated
 */
export function useNotifyError(props: any) {
  openErrorDialog({
    actions: [
      {
        label: 'Confirm',
        handler: () => {},
      },
    ],
    ...props,
  })

  if (isDefined(props.error)) {
    console.error(props.error)
  }
}
