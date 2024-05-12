export function dataTypeToPgType(dataType: string): string {
  switch (dataType) {
    case 'string':
      return 'text'
    case 'number':
      return 'integer'
    case 'boolean':
      return 'boolean'
    default:
      return 'text'
  }
}
