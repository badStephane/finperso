import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export async function seedUserData(userId: string, name: string, email: string) {
  const batch = writeBatch(db)

  batch.set(doc(db, `users/${userId}`), {
    name,
    email,
    currency: 'XOF',
    monthlyStats: {},
    settings: { currency: 'XOF' },
    createdAt: serverTimestamp(),
  })

  const comptes = [
    { name: 'Wave', type: 'MOBILE_MONEY', balance: 0, isDefault: true, color: '#1D9E75' },
    { name: 'Orange Money', type: 'MOBILE_MONEY', balance: 0, isDefault: false, color: '#BA7517' },
    { name: 'Espèces', type: 'ESPECES', balance: 0, isDefault: false, color: '#888780' },
  ]
  comptes.forEach((c) => {
    batch.set(doc(collection(db, `users/${userId}/comptes`)), c)
  })

  const depenses = [
    { name: 'Alimentation', icon: '🛒', color: '#1D9E75', type: 'DEPENSE', isDefault: true },
    { name: 'Transport', icon: '🚌', color: '#378ADD', type: 'DEPENSE', isDefault: true },
    { name: 'Logement', icon: '🏠', color: '#BA7517', type: 'DEPENSE', isDefault: true },
    { name: 'Santé', icon: '💊', color: '#D4537E', type: 'DEPENSE', isDefault: true },
    { name: 'Télécom', icon: '📱', color: '#639922', type: 'DEPENSE', isDefault: true },
    { name: 'Loisirs', icon: '🎮', color: '#7F77DD', type: 'DEPENSE', isDefault: true },
    { name: 'Éducation', icon: '📚', color: '#378ADD', type: 'DEPENSE', isDefault: true },
    { name: 'Autre', icon: '📦', color: '#888780', type: 'DEPENSE', isDefault: true },
  ]
  const revenus = [
    { name: 'Salaire', icon: '💰', color: '#1D9E75', type: 'REVENU', isDefault: true },
    { name: 'Freelance', icon: '💻', color: '#378ADD', type: 'REVENU', isDefault: true },
    { name: 'Transfert', icon: '↔️', color: '#BA7517', type: 'REVENU', isDefault: true },
    { name: 'Autre', icon: '📦', color: '#888780', type: 'REVENU', isDefault: true },
  ]
  ;[...depenses, ...revenus].forEach((cat) => {
    batch.set(doc(collection(db, `users/${userId}/categories`)), cat)
  })

  await batch.commit()
}
