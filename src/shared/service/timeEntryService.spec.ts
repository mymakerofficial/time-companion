import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
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

  afterEach(async () => {
    await serviceHelpers.cleanup()
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

    it('should fail to create a time entry with a stoppedAt before startedAt', async () => {
      const day = await dayService.createDay({
        date: PlainDate.from('2021-01-01'),
        targetBillableDuration: null,
      })

      await expect(
        timeEntryService.createTimeEntry({
          dayId: day.id,
          projectId: null,
          taskId: null,
          description: 'Test time entry',
          startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
          stoppedAt: PlainDateTime.from('2021-01-01T07:00:00'),
        }),
      ).rejects.toThrowError('Time entry must start before it stops.')

      await expect(
        timeEntryService.getTimeEntriesByDayId(day.id),
      ).resolves.toHaveLength(0)
    })

    it('should fail to create a time entry with a startedAt before midnight of the day', async () => {
      const day = await dayService.createDay({
        date: PlainDate.from('2021-01-02'),
        targetBillableDuration: null,
      })

      await expect(
        timeEntryService.createTimeEntry({
          dayId: day.id,
          projectId: null,
          taskId: null,
          description: 'Test time entry',
          startedAt: PlainDateTime.from('2021-01-01T23:59:00'),
          stoppedAt: null,
        }),
      ).rejects.toThrowError(
        'Time entry must start after midnight of the given day.',
      )
    })

    it('should not fail when trying to create a time entry with a startedAt at midnight of the day', async () => {
      const day = await dayService.createDay({
        date: PlainDate.from('2021-01-01'),
        targetBillableDuration: null,
      })

      await timeEntryService.createTimeEntry({
        dayId: day.id,
        projectId: null,
        taskId: null,
        description: 'Test time entry',
        startedAt: PlainDateTime.from('2021-01-01T00:00:00'),
        stoppedAt: null,
      })

      const timeEntries = await timeEntryService.getTimeEntriesByDayId(day.id)

      expect(firstOf(timeEntries)).toEqual(
        expect.objectContaining({
          dayId: day.id,
          projectId: null,
          taskId: null,
          description: 'Test time entry',
          startedAt: PlainDateTime.from('2021-01-01T00:00:00'),
          stoppedAt: null,
        }),
      )
    })

    it('should fail to create a time entry with a startedAt 24h after the first time entry of the day', async () => {
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

      await expect(
        timeEntryService.createTimeEntry({
          dayId: day.id,
          projectId: null,
          taskId: null,
          description: 'Test time entry',
          startedAt: PlainDateTime.from('2021-01-02T08:00:00'),
          stoppedAt: null,
        }),
      ).rejects.toThrowError(
        'Time entry must end at most 24 hours after the first time entry of the given day.',
      )
    })

    it('should fail to create a time entry with a stoppedAt 24h after the first time entry of the day', async () => {
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
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry({
          dayId: day.id,
          projectId: null,
          taskId: null,
          description: 'Test time entry',
          startedAt: PlainDateTime.from('2021-01-02T07:00:00'),
          stoppedAt: PlainDateTime.from('2021-01-02T08:00:00'),
        }),
      ).rejects.toThrowError(
        'Time entry must end at most 24 hours after the first time entry of the given day.',
      )
    })

    it.each([
      [
        '2021-01-01T08:00:00',
        '2021-01-01T09:00:00',
        '2021-01-01T08:30:00',
        '2021-01-01T09:30:00',
      ],
      [
        '2021-01-01T08:00:00',
        '2021-01-01T09:00:00',
        '2021-01-01T08:30:00',
        null,
      ],
      [
        '2021-01-01T08:00:00',
        '2021-01-01T09:00:00',
        '2021-01-01T07:30:00',
        '2021-01-01T08:30:00',
      ],
    ])(
      'should fail to create a time entry that overlaps with an existing time entry, %s - %s, %s - %s',
      async (
        firstStartedAt,
        firstStoppedAt,
        secondStartedAt,
        secondStoppedAt,
      ) => {
        const day = await dayService.createDay({
          date: PlainDate.from('2021-01-01'),
          targetBillableDuration: null,
        })

        await timeEntryService.createTimeEntry({
          dayId: day.id,
          projectId: null,
          taskId: null,
          description: 'Test time entry',
          startedAt: PlainDateTime.from(firstStartedAt),
          stoppedAt: PlainDateTime.from(firstStoppedAt),
        })

        await expect(
          timeEntryService.createTimeEntry({
            dayId: day.id,
            projectId: null,
            taskId: null,
            description: 'Test time entry',
            startedAt: PlainDateTime.from(secondStartedAt),
            stoppedAt: secondStoppedAt
              ? PlainDateTime.from(secondStoppedAt)
              : null,
          }),
        ).rejects.toThrowError(
          'Time entry must not overlap with an existing time entry.',
        )

        await expect(
          timeEntryService.getTimeEntriesByDayId(day.id),
        ).resolves.toHaveLength(1)
      },
    )

    it.todo(
      'should fail to create the first time entry of a day with startedAt not at same date',
    )
  })
})
