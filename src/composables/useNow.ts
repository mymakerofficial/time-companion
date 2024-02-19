import {customRef, type Ref, ref} from "vue";
import {useIntervalFn} from "@vueuse/core";
import {now, seconds, timeNow, today} from "@/lib/neoTime";
import {Temporal} from "temporal-polyfill";

export interface UseNowOptions {
  // Update interval
  interval?: Temporal.Duration
}

function usePrimitiveNow<
  T extends
  Temporal.PlainDate |
  Temporal.PlainTime |
  Temporal.PlainDateTime
>(options: UseNowOptions, getter: () => T) {
  const {
    interval = seconds(1)
  } = options

  return customRef<T>((track, trigger) => {
    setInterval(() => {
      trigger()
    }, interval.total({unit: 'milliseconds'}))

    return {
      get() {
        track()
        return getter()
      },
      set() {
        // do nothing
      }
    }
  })
}

export function useNow(options: UseNowOptions = {}) {
  const {
    interval = seconds(1)
  } = options

  return usePrimitiveNow({ interval }, () => now())
}

export function useTimeNow(options: UseNowOptions = {}) {
  const {
    interval = seconds(1)
  } = options

  return usePrimitiveNow({ interval }, () => timeNow())
}

export function useToday(options: UseNowOptions = {}) {
  const {
    interval = seconds(1)
  } = options

  return usePrimitiveNow({ interval }, () => today())
}