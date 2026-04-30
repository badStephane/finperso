import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { format } from 'date-fns'
import { db } from '@/lib/firebase/config'
import { nextMonthlyOccurrence } from '@/lib/utils/recurrence'
import type { CreateRecurrenceInput, Recurrence } from '@/types'

const recurrencesPath = (userId: string) => `users/${userId}/recurrences`

export async function addRecurrence(
  userId: string,
  data: CreateRecurrenceInput
): Promise<string> {
  const ref = doc(collection(db, recurrencesPath(userId)))
  const batch = writeBatch(db)
  batch.set(ref, {
    ...data,
    nextDueDate: Timestamp.fromDate(data.nextDueDate),
    createdAt: serverTimestamp(),
  })
  await batch.commit()
  return ref.id
}

export async function updateRecurrence(
  userId: string,
  id: string,
  data: Partial<CreateRecurrenceInput>
): Promise<void> {
  const payload: Record<string, unknown> = { ...data }
  if (data.nextDueDate instanceof Date) {
    payload.nextDueDate = Timestamp.fromDate(data.nextDueDate)
  }
  await updateDoc(doc(db, recurrencesPath(userId), id), payload)
}

export async function deleteRecurrence(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, recurrencesPath(userId), id))
}

export async function getRecurrences(userId: string): Promise<Recurrence[]> {
  const snap = await getDocs(
    query(collection(db, recurrencesPath(userId)), orderBy('nextDueDate', 'asc'))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Recurrence)
}

/**
 * Atomically materialize a recurrence into a real transaction and advance its
 * `nextDueDate`. Mirrors the writes in `transactionService.addTransaction`
 * (compte balance + monthlyStats + budget) so consumers see the same effect
 * whether the user creates a transaction manually or via a recurrence.
 *
 * Keep in sync with `transactionService.addTransaction` if its model changes.
 */
export async function confirmRecurrence(userId: string, rec: Recurrence): Promise<void> {
  const dueDate = rec.nextDueDate.toDate()
  const monthKey = format(dueDate, 'yyyy-MM')

  // Budget read must happen before the batch since writeBatch can't read.
  let budgetRefToUpdate: ReturnType<typeof doc> | null = null
  if (rec.type === 'DEPENSE') {
    const month = dueDate.getMonth() + 1
    const year = dueDate.getFullYear()
    const budgetSnap = await getDocs(
      query(
        collection(db, `users/${userId}/budgets`),
        where('categoryId', '==', rec.categoryId),
        where('month', '==', month),
        where('year', '==', year)
      )
    )
    if (!budgetSnap.empty) {
      budgetRefToUpdate = budgetSnap.docs[0].ref
    }
  }

  const batch = writeBatch(db)

  // 1. Create the transaction
  const txRef = doc(collection(db, `users/${userId}/transactions`))
  batch.set(txRef, {
    amount: rec.amount,
    type: rec.type,
    categoryId: rec.categoryId,
    categoryName: rec.categoryName,
    categoryIcon: rec.categoryIcon,
    compteId: rec.compteId,
    compteName: rec.compteName,
    toCompteId: null,
    toCompteName: null,
    date: rec.nextDueDate,
    note: rec.note,
    createdAt: serverTimestamp(),
    deletedAt: null,
  })

  // 2. Compte balance
  const delta = rec.type === 'REVENU' ? rec.amount : -rec.amount
  batch.update(doc(db, `users/${userId}/comptes/${rec.compteId}`), {
    balance: increment(delta),
  })

  // 3. monthlyStats — set + merge so we self-heal users whose root doc was
  // never seeded (matches transactionService.addTransaction).
  const userRef = doc(db, `users/${userId}`)
  if (rec.type === 'DEPENSE') {
    batch.set(
      userRef,
      {
        monthlyStats: {
          [monthKey]: {
            totalDepenses: increment(rec.amount),
            solde: increment(-rec.amount),
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
            totalRevenus: increment(rec.amount),
            solde: increment(rec.amount),
          },
        },
      },
      { merge: true }
    )
  }

  // 4. Budget (only DEPENSE, only if a matching budget exists)
  if (budgetRefToUpdate) {
    batch.update(budgetRefToUpdate, { spent: increment(rec.amount) })
  }

  // 5. Advance the recurrence
  const next = nextMonthlyOccurrence(dueDate, rec.dayOfMonth)
  batch.update(doc(db, recurrencesPath(userId), rec.id), {
    nextDueDate: Timestamp.fromDate(next),
  })

  await batch.commit()
}

/**
 * Advance the recurrence by one period without creating a transaction.
 * Used when the user wants to skip an occurrence (e.g. salary delayed,
 * subscription cancelled this month).
 */
export async function skipRecurrence(userId: string, rec: Recurrence): Promise<void> {
  const next = nextMonthlyOccurrence(rec.nextDueDate.toDate(), rec.dayOfMonth)
  await updateDoc(doc(db, recurrencesPath(userId), rec.id), {
    nextDueDate: Timestamp.fromDate(next),
  })
}
