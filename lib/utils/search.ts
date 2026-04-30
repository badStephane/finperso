import type { Transaction } from '@/types'

/**
 * Lowercase + strip diacritics so "café" matches "cafe" and "EDF" matches "edf".
 * Cheap enough to call inline; no need to memoize.
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function matchesTransaction(tx: Transaction, rawQuery: string): boolean {
  const trimmed = rawQuery.trim()
  if (!trimmed) return true

  // Numeric query: match against the amount as a substring of digits.
  // Lets the user type "1500" to find a 1 500 F transaction without spaces.
  const digits = trimmed.replace(/\D/g, '')
  if (digits && /^\D*\d[\d\s]*\D*$/.test(trimmed) && tx.amount.toString().includes(digits)) {
    return true
  }

  const q = normalize(trimmed)
  const fields = [
    tx.note ?? '',
    tx.categoryName,
    tx.compteName,
    tx.toCompteName ?? '',
  ]
  return fields.some((f) => normalize(f).includes(q))
}
