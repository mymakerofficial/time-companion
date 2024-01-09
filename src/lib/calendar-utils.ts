import dayjs from "dayjs";

export function minsToGridRows(timeMins: number) {
  const startOfDay = dayjs().startOf('day')
  return Math.round(startOfDay.add(timeMins, 'minutes').diff(startOfDay, 'minute') / 60 * 12)
}