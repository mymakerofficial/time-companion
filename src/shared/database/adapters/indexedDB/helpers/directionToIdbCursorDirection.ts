import type { OrderByDirection } from '@database/types/database'

export function directionToIdbCursorDirection(
  direction: OrderByDirection,
): IDBCursorDirection {
  switch (direction) {
    case 'asc':
      return 'next'
    case 'desc':
      return 'prev'
    default:
      return 'next'
  }
}
