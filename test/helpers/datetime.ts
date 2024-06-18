import { PlainDate } from '@shared/lib/datetime/plainDate'
import { faker } from '@faker-js/faker'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export function randomDate() {
  return PlainDate.from({
    year: faker.number.int({ min: 2000, max: 2100 }),
    month: faker.number.int({ min: 1, max: 12 }),
    day: faker.number.int({ min: 1, max: 28 }),
  })
}

export function randomDateTime() {
  return PlainDateTime.from({
    year: faker.number.int({ min: 2000, max: 2100 }),
    month: faker.number.int({ min: 1, max: 12 }),
    day: faker.number.int({ min: 1, max: 28 }),
    hour: faker.number.int({ min: 0, max: 23 }),
    minute: faker.number.int({ min: 0, max: 59 }),
    second: faker.number.int({ min: 0, max: 59 }),
  })
}
