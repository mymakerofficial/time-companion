import {type Ref, ref} from "vue";
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

  const now = ref<T>(getter()) as Ref<T>

  const update = () => now.value = getter()

  useIntervalFn(update, interval.milliseconds)

  return now
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