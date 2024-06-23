import { describe, expect, it, suite, test } from 'vitest'
import { useServiceTest } from '@test/fixtures/service/serviceFixtures'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { uuid } from '@shared/lib/utils/uuid'
import { acceptNull } from '@shared/lib/utils/acceptNull'
import type { TimeEntryBase } from '@shared/model/timeEntry'
import { isDefined, isNull } from '@shared/lib/utils/checks'

function timeEntryDtoContaining(timeEntry: Partial<TimeEntryBase>) {
  const { startedAt, stoppedAt, ...rest } = timeEntry

  return expect.objectContaining({
    id: expect.any(String),
    ...rest,
    startedAt: startedAt
      ? expect.toSatisfy((it) => !!startedAt?.isEqual(it))
      : expect.any(PlainDateTime),
    stoppedAt: isDefined(stoppedAt)
      ? isNull(stoppedAt)
        ? null
        : expect.toSatisfy((it) => !!stoppedAt?.isEqual(it))
      : expect.toBeOneOf([null, expect.any(PlainDateTime)]),
    createdAt: expect.any(PlainDateTime),
    modifiedAt: expect.toBeOneOf([null, expect.any(PlainDateTime)]),
    deletedAt: null,
  })
}

describe('timeEntryService', () => {
  const { timeEntryService, timeEntryHelpers, dayHelpers } = useServiceTest()

  describe('createTimeEntry', () => {
    it('should create a time entry', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).resolves.toEqual(timeEntryDtoContaining(timeEntry))

      // ensure the time entry was created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a time entry with a dayId that does not exist', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const nonExistingDayId = uuid()

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: nonExistingDayId,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError(`Day with id "${nonExistingDayId}" not found.`)

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a time entry with a stoppedAt before startedAt', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T07:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError('Time entry must start before it stops.')

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a time entry longer than 24h', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-02T10:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError('Time entry must not be longer than 24 hours.')

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to create a time entry exactly 24h long', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-02T08:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).resolves.toEqual(timeEntryDtoContaining(timeEntry))

      // ensure the time entry was created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a time entry with a startedAt before midnight of the day', async () => {
      const day = await dayHelpers.createDay('2021-01-02')

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T23:59:00'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError(
        'Time entry must start at or after "2021-01-02T00:00:00". Received "2021-01-01T23:59:00"',
      )

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to create a time entry with a startedAt at midnight of the day', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T00:00:00'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).resolves.toEqual(timeEntryDtoContaining(timeEntry))

      // ensure the time entry was created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create the first time entry of a day with startedAt not at same date', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-02T08:00:00'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError(
        'Time entry must end at or before "2021-01-02T00:00:00". Received "2021-01-02T08:00:00".',
      )

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a time entry after a running time entry', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T10:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError(
        'Time entry must not overlap with an existing time entry.',
      )

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a running time entry before another time entry', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T06:00:00'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError(
        'Time entry must not overlap with an existing time entry.',
      )

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a time entry with a startedAt more than 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-02T08:00:01'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError(
        'Time entry must end at or before "2021-01-02T08:00:00". Received "2021-01-02T08:00:01".',
      )

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to create a time entry with a startedAt 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-02T08:00:00'),
        stoppedAt: null,
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).resolves.toEqual(timeEntryDtoContaining(timeEntry))

      // ensure the time entry was created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to create a time entry with a stoppedAt more than 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-02T07:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-02T08:00:01'),
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).rejects.toThrowError(
        'Time entry must end at or before "2021-01-02T08:00:00". Received "2021-01-02T08:00:01".',
      )

      // ensure the time entry was not created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to create a time entry with a stoppedAt 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-02T07:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-02T08:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry(timeEntry),
      ).resolves.toEqual(timeEntryDtoContaining(timeEntry))

      // ensure the time entry was created.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
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
            const day = await dayHelpers.createDay('2021-01-01')

            const firstTimeEntry = timeEntryHelpers.sampleTimeEntry({
              dayId: day.id,
              startedAt: PlainDateTime.from(firstStartedAt),
              stoppedAt: PlainDateTime.from(firstStoppedAt),
            })

            const secondTimeEntry = timeEntryHelpers.sampleTimeEntry({
              dayId: day.id,
              startedAt: PlainDateTime.from(secondStartedAt),
              stoppedAt: acceptNull(PlainDateTime.from)(secondStoppedAt),
            })

            await expect(
              timeEntryService.createTimeEntry(firstTimeEntry),
            ).resolves.toEqual(timeEntryDtoContaining(firstTimeEntry))

            await expect(
              timeEntryService.createTimeEntry(secondTimeEntry),
            ).rejects.toThrowError(
              'Time entry must not overlap with an existing time entry.',
            )

            // ensure the time entry was not created.
            const timeEntries = await timeEntryService.getTimeEntriesByDayId(
              day.id,
            )
            expect(timeEntries).not.toContainEqual(
              timeEntryDtoContaining(secondTimeEntry),
            )
          },
        )
      },
    )

    it('should not fail to create time entries that touch but do not overlap', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const firstTimeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const secondTimeEntry = timeEntryHelpers.sampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T10:00:00'),
      })

      await expect(
        timeEntryService.createTimeEntry(firstTimeEntry),
      ).resolves.toEqual(timeEntryDtoContaining(firstTimeEntry))

      await expect(
        timeEntryService.createTimeEntry(secondTimeEntry),
      ).resolves.toEqual(timeEntryDtoContaining(secondTimeEntry))

      // ensure the time entries were created.
      const timeEntries = await timeEntryService.getTimeEntriesByDayId(day.id)
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(firstTimeEntry))
      expect(timeEntries).toContainEqual(
        timeEntryDtoContaining(secondTimeEntry),
      )
    })
  })

  describe('patchTimeEntry', () => {
    it('should update a time entry', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        description: 'Test time entry',
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      const update = {
        description: 'Updated time entry',
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).resolves.toEqual(timeEntryDtoContaining(update))

      // ensure the time entry was updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(update))
    })

    it('should fail to update a time entry that does not exist', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      const nonExistingId = uuid()
      const update = {
        description: 'Updated time entry',
      }

      await expect(
        timeEntryService.patchTimeEntry(nonExistingId, update),
      ).rejects.toThrowError(`Time entry with id "${nonExistingId}" not found`)

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to update a time entry with a dayId that does not exist', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const nonExistingDayId = uuid()
      const update = {
        dayId: nonExistingDayId,
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError(`Day with id "${nonExistingDayId}" not found.`)

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to update a time entry with a stoppedAt before startedAt', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T07:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError('Time entry must start before it stops.')

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to update a time entry to be longer than 24h', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T10:00:00'),
      })

      const update = {
        stoppedAt: PlainDateTime.from('2021-01-02T10:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError('Time entry must not be longer than 24 hours.')

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to update a time entry to be exactly 24h long', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T10:00:00'),
      })

      const update = {
        stoppedAt: PlainDateTime.from('2021-01-02T09:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).resolves.toEqual(timeEntryDtoContaining(update))

      // ensure the time entry was updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(update))
    })

    it('should fail to update a time entry with a startedAt before midnight of the day', async () => {
      const day = await dayHelpers.createDay('2021-01-02')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-02T06:00:00'),
        stoppedAt: null,
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-01T23:59:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError(
        'Time entry must start at or after "2021-01-02T00:00:00". Received "2021-01-01T23:59:00".',
      )

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to update a time entry with a startedAt at midnight of the day', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T06:00:00'),
        stoppedAt: null,
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-01T00:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).resolves.toEqual(timeEntryDtoContaining(update))

      // ensure the time entry was updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(update))
    })

    it('should fail to update the only time entry of a day with startedAt not at same date', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-02T08:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError(
        'Time entry must end at or before "2021-01-02T00:00:00". Received "2021-01-02T08:00:00".',
      )

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to update a time entry to be after a running time entry', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: null,
      })

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T06:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T07:00:00'),
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-01T09:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T10:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError(
        'Time entry must not overlap with an existing time entry.',
      )

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to update a time entry to be running before another time entry', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T06:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T07:00:00'),
      })

      const update = {
        stoppedAt: null,
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError(
        'Time entry must not overlap with an existing time entry.',
      )

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should fail to update a time entry with a startedAt more than 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T10:00:01'),
        stoppedAt: null,
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-02T08:00:01'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError(
        'Time entry must end at or before "2021-01-02T08:00:00". Received "2021-01-02T08:00:01".',
      )

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to update a time entry with a startedAt 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T10:00:00'),
        stoppedAt: null,
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-02T08:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).resolves.toEqual(timeEntryDtoContaining(update))

      // ensure the time entry was updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(update))
    })

    it('should fail to update a time entry with a stoppedAt more than 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T10:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T12:00:00'),
      })

      const update = {
        startedAt: PlainDateTime.from('2021-02-02T07:00:00'),
        stoppedAt: PlainDateTime.from('2021-02-02T08:00:01'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).rejects.toThrowError(
        'Time entry must end at or before "2021-01-02T08:00:00". Received "2021-02-02T08:00:01".',
      )

      // ensure the time entry was not updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).not.toContainEqual(timeEntryDtoContaining(update))
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(timeEntry))
    })

    it('should not fail to update a time entry with a stoppedAt 24h after the first time entry of the day started', async () => {
      const day = await dayHelpers.createSampleDay({
        date: PlainDate.from('2021-01-01'),
      })

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T10:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T12:00:00'),
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-02T07:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-02T08:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).resolves.toEqual(timeEntryDtoContaining(update))

      // ensure the time entry was updated.
      const timeEntries = await timeEntryHelpers.getAll()
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(update))
    })

    suite(
      'should fail to update a time entry that overlaps with an existing time entry',
      () => {
        test.each([
          [
            '2021-01-01T08:00:00',
            '2021-01-01T09:00:00',
            '2021-01-01T10:00:00',
            '2021-01-01T11:00:00',
            // ->
            '2021-01-01T08:30:00',
            '2021-01-01T09:30:00',
          ],
          [
            '2021-01-01T08:00:00',
            '2021-01-01T09:00:00',
            '2021-01-01T10:00:00',
            null,
            // ->
            '2021-01-01T08:30:00',
            null,
          ],
          [
            '2021-01-01T08:00:00',
            '2021-01-01T09:00:00',
            '2021-01-01T03:00:00',
            '2021-01-01T05:00:00',
            // ->
            '2021-01-01T07:30:00',
            '2021-01-01T08:30:00',
          ],
        ])(
          '%s - %s; %s - %s -> %s - %s',
          async (
            firstStartedAt,
            firstStoppedAt,
            secondStartedAt,
            secondStoppedAt,
            secondStartedAtUpdate,
            secondStoppedAtUpdate,
          ) => {
            const day = await dayHelpers.createDay('2021-01-01')

            const firstTimeEntry = await timeEntryHelpers.createSampleTimeEntry(
              {
                dayId: day.id,
                startedAt: PlainDateTime.from(firstStartedAt),
                stoppedAt: acceptNull(PlainDateTime.from)(firstStoppedAt),
              },
            )

            const secondTimeEntry =
              await timeEntryHelpers.createSampleTimeEntry({
                dayId: day.id,
                startedAt: PlainDateTime.from(secondStartedAt),
                stoppedAt: acceptNull(PlainDateTime.from)(secondStoppedAt),
              })

            const update = {
              startedAt: PlainDateTime.from(secondStartedAtUpdate),
              stoppedAt: acceptNull(PlainDateTime.from)(secondStoppedAtUpdate),
            }

            await expect(
              timeEntryService.patchTimeEntry(secondTimeEntry.id, update),
            ).rejects.toThrowError(
              'Time entry must not overlap with an existing time entry.',
            )

            const timeEntries = await timeEntryHelpers.getAll()
            expect(timeEntries).toContainEqual(
              timeEntryDtoContaining(firstTimeEntry),
            )
            expect(timeEntries).toContainEqual(
              timeEntryDtoContaining(secondTimeEntry),
            )
            expect(timeEntries).not.toContainEqual(
              timeEntryDtoContaining(update),
            )
          },
        )
      },
    )

    it('should not fail to updates time entries to touch but do not overlap', async () => {
      const day = await dayHelpers.createDay('2021-01-01')

      await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T08:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T09:00:00'),
      })

      const timeEntry = await timeEntryHelpers.createSampleTimeEntry({
        dayId: day.id,
        startedAt: PlainDateTime.from('2021-01-01T12:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T14:00:00'),
      })

      const update = {
        startedAt: PlainDateTime.from('2021-01-01T06:00:00'),
        stoppedAt: PlainDateTime.from('2021-01-01T08:00:00'),
      }

      await expect(
        timeEntryService.patchTimeEntry(timeEntry.id, update),
      ).resolves.toEqual(timeEntryDtoContaining(update))

      // ensure the time entry was updated.
      const timeEntries = await timeEntryService.getTimeEntriesByDayId(day.id)
      expect(timeEntries).toContainEqual(timeEntryDtoContaining(update))
    })
  })
})
