import { addMonths, lastDayOfMonth, setDate, startOfDay } from 'date-fns'

/**
 * Move from `currentDue` to the same day of the next month, clamping to the
 * last valid day if the target month is shorter (e.g. day 31 -> Feb 28).
 *
 * The original `dayOfMonth` is preserved across short months — bouncing back
 * up the next time the month allows it (Feb 28 -> Mar 31, not Mar 28).
 */
export function nextMonthlyOccurrence(currentDue: Date, dayOfMonth: number): Date {
  const firstOfCurrent = setDate(startOfDay(currentDue), 1)
  const firstOfNext = addMonths(firstOfCurrent, 1)
  const lastDay = lastDayOfMonth(firstOfNext).getDate()
  return setDate(firstOfNext, Math.min(dayOfMonth, lastDay))
}
