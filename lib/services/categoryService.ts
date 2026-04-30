import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Category, CategoryType } from '@/types'

export async function getCategories(userId: string): Promise<Category[]> {
  const snap = await getDocs(collection(db, `users/${userId}/categories`))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)
}

export async function addCategory(
  userId: string,
  data: { name: string; icon: string; color: string; type: CategoryType }
): Promise<string> {
  const batch = writeBatch(db)
  const ref = doc(collection(db, `users/${userId}/categories`))
  batch.set(ref, {
    ...data,
    isDefault: false,
  })
  await batch.commit()
  return ref.id
}

export async function deleteCategory(userId: string, categoryId: string) {
  const batch = writeBatch(db)
  batch.delete(doc(db, `users/${userId}/categories/${categoryId}`))
  await batch.commit()
}
