import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Budget } from '@/types'

export async function getBudgets(
  userId: string,
  month: number,
  year: number
): Promise<Budget[]> {
  const q = query(
    collection(db, `users/${userId}/budgets`),
    where('month', '==', month),
    where('year', '==', year)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Budget)
}

export async function setBudget(
  userId: string,
  data: {
    categoryId: string
    categoryName: string
    categoryIcon: string
    amount: number
    month: number
    year: number
  }
): Promise<string> {
  const existing = await getDocs(
    query(
      collection(db, `users/${userId}/budgets`),
      where('categoryId', '==', data.categoryId),
      where('month', '==', data.month),
      where('year', '==', data.year)
    )
  )

  const batch = writeBatch(db)

  if (!existing.empty) {
    batch.update(existing.docs[0].ref, { amount: data.amount })
    await batch.commit()
    return existing.docs[0].id
  }

  const ref = doc(collection(db, `users/${userId}/budgets`))
  batch.set(ref, {
    ...data,
    spent: 0,
  })
  await batch.commit()
  return ref.id
}

export async function deleteBudget(userId: string, budgetId: string) {
  const batch = writeBatch(db)
  batch.delete(doc(db, `users/${userId}/budgets/${budgetId}`))
  await batch.commit()
}
