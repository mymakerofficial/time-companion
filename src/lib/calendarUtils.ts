export function minutesToGridRows(minutes: number) {
  const rowsPerHour = 12
  return Math.round(minutes / 60 * rowsPerHour)
}