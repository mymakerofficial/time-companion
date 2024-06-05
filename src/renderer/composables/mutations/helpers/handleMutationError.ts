import { toast } from 'vue-sonner'

export function handleMutationError(error: Error) {
  console.error(error)
  toast.error(error.message)
}
