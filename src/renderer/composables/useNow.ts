import { customRef } from 'vue'
import { Duration } from '@shared/lib/datetime/duration'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { PlainTime } from '@shared/lib/datetime/plainTime'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export interface UseNowOptions {
  // Update interval
  interval?: Duration
}

function usePrimitiveNow<T extends PlainDate | PlainTime | PlainDateTime>(
  options: UseNowOptions,
  getter: () => T,
) {
  const { interval = Duration.from({ seconds: 1 }) } = options

  return customRef<T>((track, trigger) => {
    setInterval(
      () => {
        trigger()
      },
      interval.total({ unit: 'milliseconds' }),
    )

    return {
      get() {
        track()
        return getter()
      },
      set() {
        // do nothing
      },
    }
  })
}

export function useNow(options: UseNowOptions = {}) {
  const { interval = Duration.from({ seconds: 1 }) } = options

  return usePrimitiveNow({ interval }, () => PlainDateTime.now())
}

export function useTimeNow(options: UseNowOptions = {}) {
  const { interval = Duration.from({ seconds: 1 }) } = options

  return usePrimitiveNow({ interval }, () => PlainTime.now())
}

export function useToday(options: UseNowOptions = {}) {
  const { interval = Duration.from({ hours: 1 }) } = options

  return usePrimitiveNow({ interval }, () => PlainDate.now())
}
