import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  increment,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { format } from 'date-fns'
import type { CreateTransactionInput, Transaction, TransactionFilters } from '@/types'

export async function addTransaction(
  userId: string,
  data: CreateTransactionInput
): Promise<string> {
  const batch = writeBatch(db)

  const txRef = doc(collection(db, `users/${userId}/transactions`))
  batch.set(txRef, {
    ...data,
    date: data.date,
    createdAt: serverTimestamp(),
    deletedAt: null,
  })

  const compteRef = doc(db, `users/${userId}/comptes/${data.compteId}`)
  const delta = data.type === 'REVENU' ? data.amount : -data.amount
  batch.update(compteRef, {
    balance: increment(delta),
  })

  const monthKey = format(data.date, 'yyyy-MM')
  const userRef = doc(db, `users/${userId}`)
  if (data.type === 'DEPENSE') {
    batch.update(userRef, {
      [`monthlyStats.${monthKey}.totalDepenses`]: increment(data.amount),
      [`monthlyStats.${monthKey}.solde`]: increment(-data.amount),
    })
  } else {
    batch.update(userRef, {
      [`monthlyStats.${monthKey}.totalRevenus`]: increment(data.amount),
      [`monthlyStats.${monthKey}.solde`]: increment(data.amount),
    })
  }

  if (data.type === 'DEPENSE') {
    const month = data.date.getMonth() + 1
    const year = data.date.getFullYear()
    const budgetQuery = query(
      collection(db, `users/${userId}/budgets`),
      where('categoryId', '==', data.categoryId),
      where('month', '==', month),
      where('year', '==', year)
    )
    const budgetSnap = await getDocs(budgetQuery)
    if (!budgetSnap.empty) {
      batch.update(budgetSnap.docs[0].ref, {
        spent: increment(data.amount),
      })
    }
  }

  await batch.commit()
  return txRef.id
}

export async function getTransactions(
  userId: string,
  filters: TransactionFilters,
  lastDoc?: DocumentSnapshot
) {
  const constraints: Parameters<typeof query>[1][] = [
    where('deletedAt', '==', null),
    orderBy('date', 'desc'),
    limit(20),
  ]

  if (filters.type) constraints.push(where('type', '==', filters.type))
  if (filters.categoryId) constraints.push(where('categoryId', '==', filters.categoryId))
  if (lastDoc) constraints.push(startAfter(lastDoc))

  const q = query(collection(db, `users/${userId}/transactions`), ...constraints)
  const snap = await getDocs(q)

  return {
    transactions: snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Transaction[],
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === 20,
  }
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
  transaction: Transaction
) {
  const batch = writeBatch(db)

  batch.update(doc(db, `users/${userId}/transactions/${transactionId}`), {
    deletedAt: serverTimestamp(),
  })

  const delta = transaction.type === 'REVENU' ? -transaction.amount : transaction.amount
  batch.update(doc(db, `users/${userId}/comptes/${transaction.compteId}`), {
    balance: increment(delta),
  })

  const monthKey = format(transaction.date.toDate(), 'yyyy-MM')
  const userRef = doc(db, `users/${userId}`)
  if (transaction.type === 'DEPENSE') {
    batch.update(userRef, {
      [`monthlyStats.${monthKey}.totalDepenses`]: increment(-transaction.amount),
      [`monthlyStats.${monthKey}.solde`]: increment(transaction.amount),
    })
  } else {
    batch.update(userRef, {
      [`monthlyStats.${monthKey}.totalRevenus`]: increment(-transaction.amount),
      [`monthlyStats.${monthKey}.solde`]: increment(-transaction.amount),
    })
  }

  if (transaction.type === 'DEPENSE') {
    const month = transaction.date.toDate().getMonth() + 1
    const year = transaction.date.toDate().getFullYear()
    const budgetQuery = query(
      collection(db, `users/${userId}/budgets`),
      where('categoryId', '==', transaction.categoryId),
      where('month', '==', month),
      where('year', '==', year)
    )
    const budgetSnap = await getDocs(budgetQuery)
    if (!budgetSnap.empty) {
      batch.update(budgetSnap.docs[0].ref, {
        spent: increment(-transaction.amount),
      })
    }
  }

  await batch.commit()
}
