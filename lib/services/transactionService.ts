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

  if (data.type === 'TRANSFERT') {
    batch.update(doc(db, `users/${userId}/comptes/${data.compteId}`), {
      balance: increment(-data.amount),
    })
    if (data.toCompteId) {
      batch.update(doc(db, `users/${userId}/comptes/${data.toCompteId}`), {
        balance: increment(data.amount),
      })
    }
    await batch.commit()
    return txRef.id
  }

  const compteRef = doc(db, `users/${userId}/comptes/${data.compteId}`)
  const delta = data.type === 'REVENU' ? data.amount : -data.amount
  batch.update(compteRef, {
    balance: increment(delta),
  })

  const monthKey = format(data.date, 'yyyy-MM')
  const userRef = doc(db, `users/${userId}`)
  // set + merge so we self-heal users whose root doc was never seeded
  // (early signups, migrated accounts) instead of failing the whole batch.
  if (data.type === 'DEPENSE') {
    batch.set(
      userRef,
      {
        monthlyStats: {
          [monthKey]: {
            totalDepenses: increment(data.amount),
            solde: increment(-data.amount),
          },
        },
      },
      { merge: true }
    )
  } else {
    batch.set(
      userRef,
      {
        monthlyStats: {
          [monthKey]: {
            totalRevenus: increment(data.amount),
            solde: increment(data.amount),
          },
        },
      },
      { merge: true }
    )
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

/**
 * Update an existing transaction's amount and/or note. Re-applies the delta
 * to the account balance, the user's monthlyStats, and the matching budget
 * (for DEPENSE) so the running totals stay accurate.
 *
 * Type, compte, category and date are not editable here — those changes
 * touch too many denormalized aggregates and would deserve their own flow.
 */
export async function updateTransaction(
  userId: string,
  txId: string,
  oldTx: Transaction,
  newData: { amount: number; note: string | null }
) {
  const batch = writeBatch(db)
  const txRef = doc(db, `users/${userId}/transactions/${txId}`)
  batch.update(txRef, {
    amount: newData.amount,
    note: newData.note,
  })

  const amountDelta = newData.amount - oldTx.amount
  if (amountDelta === 0) {
    await batch.commit()
    return
  }

  if (oldTx.type === 'TRANSFERT') {
    // Source: was -old, now -new → delta = -(new-old)
    batch.update(doc(db, `users/${userId}/comptes/${oldTx.compteId}`), {
      balance: increment(-amountDelta),
    })
    if (oldTx.toCompteId) {
      batch.update(doc(db, `users/${userId}/comptes/${oldTx.toCompteId}`), {
        balance: increment(amountDelta),
      })
    }
    await batch.commit()
    return
  }

  // DEPENSE / REVENU: balance was ±old, now ±new → delta = ±(new-old)
  const sign = oldTx.type === 'REVENU' ? 1 : -1
  batch.update(doc(db, `users/${userId}/comptes/${oldTx.compteId}`), {
    balance: increment(sign * amountDelta),
  })

  const monthKey = format(oldTx.date.toDate(), 'yyyy-MM')
  const userRef = doc(db, `users/${userId}`)
  if (oldTx.type === 'DEPENSE') {
    batch.set(
      userRef,
      {
        monthlyStats: {
          [monthKey]: {
            totalDepenses: increment(amountDelta),
            solde: increment(-amountDelta),
          },
        },
      },
      { merge: true }
    )
  } else {
    batch.set(
      userRef,
      {
        monthlyStats: {
          [monthKey]: {
            totalRevenus: increment(amountDelta),
            solde: increment(amountDelta),
          },
        },
      },
      { merge: true }
    )
  }

  if (oldTx.type === 'DEPENSE') {
    const month = oldTx.date.toDate().getMonth() + 1
    const year = oldTx.date.toDate().getFullYear()
    const budgetQuery = query(
      collection(db, `users/${userId}/budgets`),
      where('categoryId', '==', oldTx.categoryId),
      where('month', '==', month),
      where('year', '==', year)
    )
    const budgetSnap = await getDocs(budgetQuery)
    if (!budgetSnap.empty) {
      batch.update(budgetSnap.docs[0].ref, {
        spent: increment(amountDelta),
      })
    }
  }

  await batch.commit()
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

  if (transaction.type === 'TRANSFERT') {
    batch.update(doc(db, `users/${userId}/comptes/${transaction.compteId}`), {
      balance: increment(transaction.amount),
    })
    if (transaction.toCompteId) {
      batch.update(doc(db, `users/${userId}/comptes/${transaction.toCompteId}`), {
        balance: increment(-transaction.amount),
      })
    }
    await batch.commit()
    return
  }

  const delta = transaction.type === 'REVENU' ? -transaction.amount : transaction.amount
  batch.update(doc(db, `users/${userId}/comptes/${transaction.compteId}`), {
    balance: increment(delta),
  })

  const monthKey = format(transaction.date.toDate(), 'yyyy-MM')
  const userRef = doc(db, `users/${userId}`)
  if (transaction.type === 'DEPENSE') {
    batch.set(
      userRef,
      {
        monthlyStats: {
          [monthKey]: {
            totalDepenses: increment(-transaction.amount),
            solde: increment(transaction.amount),
          },
        },
      },
      { merge: true }
    )
  } else {
    batch.set(
      userRef,
      {
        monthlyStats: {
          [monthKey]: {
            totalRevenus: increment(-transaction.amount),
            solde: increment(-transaction.amount),
          },
        },
      },
      { merge: true }
    )
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
