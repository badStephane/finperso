import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { formatCFA } from '@/lib/utils/currency'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Transaction } from '@/types'

export async function exportTransactionsCSV(userId: string): Promise<string> {
  const q = query(
    collection(db, `users/${userId}/transactions`),
    where('deletedAt', '==', null),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  const transactions = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction)

  const headers = ['Date', 'Type', 'Catégorie', 'Compte', 'Montant', 'Note']
  const rows = transactions.map((tx) => [
    format(tx.date.toDate(), 'dd/MM/yyyy', { locale: fr }),
    tx.type === 'DEPENSE' ? 'Dépense' : 'Revenu',
    tx.categoryName,
    tx.compteName,
    tx.type === 'DEPENSE' ? `-${tx.amount}` : `${tx.amount}`,
    tx.note ?? '',
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
  return csv
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
