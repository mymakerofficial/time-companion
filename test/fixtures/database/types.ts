import type { HasId } from '@shared/model/helpers/hasId'

export interface Person extends HasId {
  firstName: string
  lastName: string
  username: string
  gender: string
  age: number
}

export interface Pet extends HasId {
  name: string
  age: number
  ownerId: string
}
