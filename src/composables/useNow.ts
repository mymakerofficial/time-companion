import {ref} from "vue";
import {now, useIntervalFn} from "@vueuse/core";
import {seconds, timeNow, today} from "@/lib/neoTime";
import type {Duration} from "@js-joda/core";

export interface UseNowOptions {
  // Update interval
  interval?: Duration
}

function usePrimitiveNow<T>(options: UseNowOptions, getter: () => T) {
  const {
    interval = seconds(1)
  } = options

  const now = ref(getter())

  const update = () => now.value = getter()

  useIntervalFn(update, interval.toMillis())

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