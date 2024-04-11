import { isNotEmpty } from '@shared/lib/utils/checks'

class InvalidFieldsError<T extends object> extends Error {
  constructor(invalidFields: Array<keyof T>) {
    super(
      `Tried to patch entity using illegal fields: ${invalidFields.map(quote).join(', ')}.`,
    )
  }
}

function quote(str: any): string {
  return `"${str}"`
}

// throws an error if any of the changed fields are not allowed
export function assertOnlyValidFieldsChanged<T extends object>(
  changedFields: Array<keyof T>,
  allowedFields: Array<keyof T>,
): void {
  const invalidFields = changedFields.filter(
    (field) => !allowedFields.includes(field),
  )

  if (isNotEmpty(invalidFields)) {
    throw new InvalidFieldsError(invalidFields)
  }
}
