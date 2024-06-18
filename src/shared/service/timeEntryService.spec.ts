import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  suite,
  test,
} from 'vitest'
import { useServiceFixtures } from '@test/fixtures/service/serviceFixtures'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { firstOf } from '@shared/lib/utils/list'
import { uuid } from '@shared/lib/utils/uuid'
import { acceptNull } from '@shared/lib/utils/acceptNull'

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

    suite(
      'should fail to create a time entry that overlaps with an existing time entry',
      () => {
        test.each([
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
          '%s - %s, %s - %s',
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
                stoppedAt: acceptNull(PlainDateTime.from)(secondStoppedAt),
              }),
            ).rejects.toThrowError(
              'Time entry must not overlap with an existing time entry.',
            )

            await expect(
              timeEntryService.getTimeEntriesByDayId(day.id),
            ).resolves.toHaveLength(1)
          },
        )
      },
    )

    it('should fail to create the first time entry of a day with startedAt not at same date', async () => {
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
          startedAt: PlainDateTime.from('2021-01-02T08:00:00'),
          stoppedAt: null,
        }),
      ).rejects.toThrowError(
        'The first time entry of a day must start on the same date.',
      )
    })

    it('should fail to create a time entry while another time entry without stoppedAt exists', async () => {
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
          startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
          stoppedAt: PlainDateTime.from('2021-01-01T10:00:00'),
        }),
      ).rejects.toThrowError()
    })
  })

  describe('patchTimeEntry', () => {
    it('should update a time entry', async () => {
      const day = await dayService.createDay({
        date: PlainDate.from('2021-01-01'),
        targetBillableDuration: null,
      })

      const timeEntry = await timeEntryService.createTimeEntry({
        dayId: day.id,
        projectId: null,
        taskId: null,
        description: 'Test time entry',
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      await timeEntryService.patchTimeEntry(timeEntry.id, {
        description: 'Updated time entry',
      })

      const timeEntries = await timeEntryService.getTimeEntriesByDayId(day.id)

      expect(firstOf(timeEntries)).toEqual(
        expect.objectContaining({
          description: 'Updated time entry',
        }),
      )
    })

    it('should fail when trying to update a time entry that does not exist', async () => {
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

      const nonExistingId = uuid()

      await expect(
        timeEntryService.patchTimeEntry(nonExistingId, {
          description: 'Updated time entry',
        }),
      ).rejects.toThrowError(`Time entry with id "${nonExistingId}" not found`)
    })

    it('should fail when trying to update a time entry with a stoppedAt before startedAt', async () => {
      const day = await dayService.createDay({
        date: PlainDate.from('2021-01-01'),
        targetBillableDuration: null,
      })

      const timeEntry = await timeEntryService.createTimeEntry({
        dayId: day.id,
        projectId: null,
        taskId: null,
        description: 'Test time entry',
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, {
          startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
          stoppedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        }),
      ).rejects.toThrowError('Time entry must start before it stops.')
    })

    it('should fail when trying to update a time entry with a startedAt before midnight of the day', async () => {
      const day = await dayService.createDay({
        date: PlainDate.from('2021-01-02'),
        targetBillableDuration: null,
      })

      const timeEntry = await timeEntryService.createTimeEntry({
        dayId: day.id,
        projectId: null,
        taskId: null,
        description: 'Test time entry',
        startedAt: PlainDateTime.from('2021-01-02T00:00:00'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, {
          startedAt: PlainDateTime.from('2021-01-01T23:59:00'),
        }),
      ).rejects.toThrowError(
        'Time entry must start after midnight of the given day.',
      )
    })
  })
})
