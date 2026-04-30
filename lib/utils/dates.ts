import { format, formatRelative, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: Date): string {
  if (isToday(date)) return "Aujourd'hui"
  if (isYesterday(date)) return 'Hier'
  return format(date, 'd MMMM yyyy', { locale: fr })
}

export function formatDateShort(date: Date): string {
  if (isToday(date)) return "Aujourd'hui"
  if (isYesterday(date)) return 'Hier'
  return format(date, 'd MMM', { locale: fr })
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: fr })
}

export function getMonthKey(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function formatRelativeDate(date: Date): string {
  return formatRelative(date, new Date(), { locale: fr })
}
