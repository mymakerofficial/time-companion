import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { useServiceFixtures } from '@test/fixtures/service/serviceFixtures'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { firstOf } from '@shared/lib/utils/list'

describe('timeEntryService', () => {
  const { serviceHelpers, timeEntryService, dayService } = useServiceFixtures()

  beforeAll(async () => {
    await serviceHelpers.setup()
  })

  afterAll(async () => {
    await serviceHelpers.teardown()
  })

  describe('createTimeEntry', () => {
    it('should create and retrieve a time entry', async () => {
      const day = await dayService.createDay({
        date: PlainDate.from('2021-01-01'),
        targetBillableDuration: null,
      })

      await timeEntryService.createTimeEntry({
        dayId: day.id,
        projectId: null,
        taskId: null,
        description: 'Test time entry',
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      const timeEntries = await timeEntryService.getTimeEntriesByDayId(day.id)

      console.log(timeEntries)

      expect(firstOf(timeEntries)).toEqual(
        expect.objectContaining({
          dayId: day.id,
          projectId: null,
          taskId: null,
          description: 'Test time entry',
          startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
          stoppedAt: null,
        }),
      )
    })

    it.todo(
      'should fail to create a time entry with a stoppedAt before startedAt',
    )

    it.todo(
      'should fail to create a time entry with a startedAt before midnight of the day',
    )

    it.todo(
      'should fail to create a time entry with a startedAt 24h after the first time entry of the day',
    )

    it.todo(
      'should fail to create a time entry with a stoppedAt 24h after the first time entry of the day',
    )

    it.todo(
      'should fail to create a time entry that overlaps with an existing time entry',
    )
  })
})
