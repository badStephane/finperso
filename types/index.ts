import { Timestamp } from 'firebase/firestore'

export type CompteType = 'MOBILE_MONEY' | 'BANQUE' | 'ESPECES' | 'EPARGNE'
export type TransactionType = 'DEPENSE' | 'REVENU' | 'TRANSFERT'
export type CategoryType = 'DEPENSE' | 'REVENU'

export interface MonthlyStats {
  totalDepenses: number
  totalRevenus: number
  solde: number
}

export interface UserSettings {
  defaultCompteId?: string
  currency: 'XOF'
}

export interface UserProfile {
  email: string
  name: string
  createdAt: Timestamp
  monthlyStats: Record<string, MonthlyStats>
  settings: UserSettings
}

export interface Compte {
  id: string
  name: string
  type: CompteType
  balance: number
  isDefault: boolean
  color: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: CategoryType
  isDefault: boolean
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  categoryId: string
  categoryName: string
  categoryIcon: string
  compteId: string
  compteName: string
  /** Destination account (TRANSFERT only). compteId is the source. */
  toCompteId: string | null
  toCompteName: string | null
  date: Timestamp
  note: string | null
  createdAt: Timestamp
  deletedAt: Timestamp | null
}

export interface CreateTransactionInput {
  amount: number
  type: TransactionType
  categoryId: string
  categoryName: string
  categoryIcon: string
  compteId: string
  compteName: string
  toCompteId: string | null
  toCompteName: string | null
  date: Date
  note: string | null
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
}

export interface Objectif {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Timestamp | null
  icon: string
  color: string
  isCompleted: boolean
  createdAt: Timestamp
}

export interface Contribution {
  id: string
  amount: number
  date: Timestamp
  note: string | null
}

export interface Budget {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  amount: number
  spent: number
  month: number
  year: number
}
