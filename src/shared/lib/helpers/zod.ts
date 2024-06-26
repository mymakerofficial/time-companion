import { fromError } from 'zod-validation-error'

export function runZod(block: () => void) {
  try {
    block()
  } catch (error) {
    throw fromError(error, {
      prefix: null,
      includePath: false,
    })
  }
}
