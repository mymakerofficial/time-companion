import type { ColumnType, OrderByDirection } from '@database/types/database'

// TODO: make this less awful
export function compareFn(
  orderByColumnName: any,
  orderByColumnType: ColumnType,
  direction: OrderByDirection,
) {
  if (orderByColumnType === 'time' || orderByColumnType === 'interval') {
    return direction === 'asc'
      ? (a: any, b: any) =>
          a[orderByColumnName].totalSeconds > b[orderByColumnName].totalSeconds
            ? 1
            : -1
      : (a: any, b: any) =>
          a[orderByColumnName].totalSeconds < b[orderByColumnName].totalSeconds
            ? 1
            : -1
  }

  return direction === 'asc'
    ? (a: any, b: any) => (a[orderByColumnName] > b[orderByColumnName] ? 1 : -1)
    : (a: any, b: any) => (a[orderByColumnName] < b[orderByColumnName] ? 1 : -1)
}
