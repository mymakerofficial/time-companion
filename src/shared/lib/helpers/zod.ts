import { fromError } from 'zod-validation-error'

export function runZod<T>(block: () => T) {
  try {
    return block()
  } catch (error) {
    throw fromError(error, {
      prefix: null,
      includePath: false,
    })
  }
}
