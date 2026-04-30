import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Compte, CompteType } from '@/types'

export async function getComptes(userId: string): Promise<Compte[]> {
  const snap = await getDocs(collection(db, `users/${userId}/comptes`))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Compte)
}

export async function addCompte(
  userId: string,
  data: { name: string; type: CompteType; color: string }
): Promise<string> {
  const batch = writeBatch(db)
  const ref = doc(collection(db, `users/${userId}/comptes`))
  batch.set(ref, {
    ...data,
    balance: 0,
    isDefault: false,
  })
  await batch.commit()
  return ref.id
}

export async function updateCompte(
  userId: string,
  compteId: string,
  data: { name: string; type: CompteType; color: string }
) {
  const batch = writeBatch(db)
  batch.update(doc(db, `users/${userId}/comptes/${compteId}`), data)
  await batch.commit()
}

export async function deleteCompte(userId: string, compteId: string) {
  const batch = writeBatch(db)
  batch.delete(doc(db, `users/${userId}/comptes/${compteId}`))
  await batch.commit()
}
