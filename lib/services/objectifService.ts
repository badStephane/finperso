import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Objectif, Contribution } from '@/types'

export async function getObjectifs(userId: string): Promise<Objectif[]> {
  const q = query(
    collection(db, `users/${userId}/objectifs`),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Objectif)
}

export async function getObjectif(userId: string, objectifId: string): Promise<Objectif | null> {
  const snap = await getDoc(doc(db, `users/${userId}/objectifs/${objectifId}`))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Objectif
}

export async function createObjectif(
  userId: string,
  data: {
    name: string
    targetAmount: number
    deadline: Date | null
    icon: string
    color: string
  }
): Promise<string> {
  const batch = writeBatch(db)
  const ref = doc(collection(db, `users/${userId}/objectifs`))
  batch.set(ref, {
    ...data,
    deadline: data.deadline ? Timestamp.fromDate(data.deadline) : null,
    currentAmount: 0,
    isCompleted: false,
    createdAt: serverTimestamp(),
  })
  await batch.commit()
  return ref.id
}

export async function addContribution(
  userId: string,
  objectifId: string,
  data: { amount: number; note: string | null }
): Promise<string> {
  const batch = writeBatch(db)

  const contribRef = doc(
    collection(db, `users/${userId}/objectifs/${objectifId}/contributions`)
  )
  batch.set(contribRef, {
    amount: data.amount,
    date: serverTimestamp(),
    note: data.note,
  })

  const objectifRef = doc(db, `users/${userId}/objectifs/${objectifId}`)
  batch.update(objectifRef, {
    currentAmount: increment(data.amount),
  })

  await batch.commit()

  // Check if completed
  const objectifSnap = await getDoc(objectifRef)
  if (objectifSnap.exists()) {
    const obj = objectifSnap.data()
    if (obj.currentAmount >= obj.targetAmount) {
      const { writeBatch: wb } = await import('firebase/firestore')
      const completeBatch = wb(db)
      completeBatch.update(objectifRef, { isCompleted: true })
      await completeBatch.commit()
    }
  }

  return contribRef.id
}

export async function getContributions(
  userId: string,
  objectifId: string
): Promise<Contribution[]> {
  const q = query(
    collection(db, `users/${userId}/objectifs/${objectifId}/contributions`),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Contribution)
}

export async function deleteObjectif(userId: string, objectifId: string) {
  const batch = writeBatch(db)
  batch.delete(doc(db, `users/${userId}/objectifs/${objectifId}`))
  await batch.commit()
}
