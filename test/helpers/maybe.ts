import { faker } from '@faker-js/faker'

export function isSometimesNullOr<T>(value: T) {
  return faker.datatype.boolean() ? null : value
}
