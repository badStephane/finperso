# Prompt Claude Code — Finperso PWA (Firebase Spark — 0 €)

## Contexte du projet

Tu vas construire **Finperso**, une Progressive Web App (PWA) de gestion financière personnelle pour les particuliers en Afrique de l'Ouest francophone (Sénégal en priorité). L'app est **100% mobile-first**, installable sur Android via Chrome, optimisée pour fonctionner hors-ligne, et utilise le franc CFA (F CFA) comme devise.

**Contrainte absolue : rester sur Firebase Spark plan (gratuit, 0 €). Ne jamais activer la facturation. Ne jamais utiliser les Cloud Functions. Ne jamais utiliser l'auth SMS.**

---

## Stack technique

- **Framework** : Next.js 14+ (App Router, TypeScript strict)
- **Backend / Auth / DB** : Firebase (Firestore + Firebase Auth) — plan Spark uniquement
- **Styling** : Tailwind CSS v3 (mobile-first, pas de lib UI externe)
- **State** : Zustand (stores légers par feature)
- **Formulaires** : React Hook Form + Zod (validation client)
- **Charts** : Recharts
- **PWA** : next-pwa (service worker, manifest, offline)
- **Icons** : Lucide React uniquement
- **Date** : date-fns avec locale `fr`
- **Firebase SDK** : `firebase` v10+ (modular SDK, tree-shakeable)

**Ce qu'on N'utilise PAS pour rester gratuit :**
- ❌ Cloud Functions (remplacé par logique client + Firestore rules)
- ❌ Firebase Extensions (payantes)
- ❌ Phone Authentication / SMS
- ❌ Firebase App Check (optionnel Blaze)
- ❌ Cloud Run, BigQuery, Pub/Sub

---

## Limites Spark à respecter (quotas journaliers)

| Service | Limite gratuite |
|---|---|
| Firestore lectures | 50 000 / jour |
| Firestore écritures | 20 000 / jour |
| Firestore suppressions | 20 000 / jour |
| Firestore stockage | 1 Go total |
| Firebase Auth | Illimité (email/password) |
| Firebase Hosting | 10 Go transfert / mois |
| Firebase Storage | 1 Go stocké, 10 Go download / mois |

### Stratégies pour rester dans les quotas

1. **Dénormaliser les données** : stocker les totaux précalculés dans le document `user` pour éviter d'agréger à chaque lecture (ex: `monthlyStats` mis à jour à chaque transaction)
2. **Pagination** : charger max 20 transactions par page, pas de chargement global
3. **Cache local** : stocker les données du mois courant dans `localStorage` + Zustand, ne re-fetcher que si nécessaire
4. **Listeners ciblés** : utiliser `onSnapshot` uniquement sur les documents actifs, pas sur des collections entières
5. **Pas de realtime inutile** : utiliser `getDocs` (lecture one-shot) pour les listes, `onSnapshot` uniquement pour le solde en temps réel

---

## Structure Firestore (NoSQL — penser en documents)

```
users/{userId}
  ├── email: string
  ├── name: string
  ├── createdAt: timestamp
  ├── monthlyStats: {              ← dénormalisé, mis à jour à chaque tx
  │     "2026-04": {
  │       totalDepenses: number,
  │       totalRevenus: number,
  │       solde: number
  │     }
  │   }
  └── settings: {
        defaultCompteId: string,
        currency: "XOF"
      }

users/{userId}/comptes/{compteId}
  ├── name: string                 ← "Wave", "Orange Money", "Espèces", "Banque"
  ├── type: "MOBILE_MONEY" | "BANQUE" | "ESPECES" | "EPARGNE"
  ├── balance: number              ← mis à jour à chaque transaction
  ├── isDefault: boolean
  └── color: string

users/{userId}/categories/{categoryId}
  ├── name: string
  ├── icon: string                 ← emoji
  ├── color: string
  ├── type: "DEPENSE" | "REVENU"
  └── isDefault: boolean

users/{userId}/transactions/{transactionId}
  ├── amount: number
  ├── type: "DEPENSE" | "REVENU"
  ├── categoryId: string
  ├── categoryName: string         ← dénormalisé (évite une lecture catégorie)
  ├── categoryIcon: string         ← dénormalisé
  ├── compteId: string
  ├── compteName: string           ← dénormalisé
  ├── date: timestamp
  ├── note: string | null
  ├── createdAt: timestamp
  └── deletedAt: timestamp | null  ← soft delete

users/{userId}/objectifs/{objectifId}
  ├── name: string
  ├── targetAmount: number
  ├── currentAmount: number        ← mis à jour à chaque contribution
  ├── deadline: timestamp | null
  ├── icon: string
  ├── color: string
  ├── isCompleted: boolean
  └── createdAt: timestamp

users/{userId}/objectifs/{objectifId}/contributions/{contributionId}
  ├── amount: number
  ├── date: timestamp
  └── note: string | null

users/{userId}/budgets/{budgetId}
  ├── categoryId: string
  ├── categoryName: string         ← dénormalisé
  ├── categoryIcon: string         ← dénormalisé
  ├── amount: number               ← budget alloué
  ├── spent: number                ← mis à jour à chaque transaction de cette catégorie
  ├── month: number                ← 1-12
  └── year: number
```

---

## Firestore Security Rules (à créer dans `firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Un user ne peut lire/écrire que ses propres données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /comptes/{compteId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /objectifs/{objectifId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        match /contributions/{contributionId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Architecture des fichiers

```
finperso/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              ← Layout avec BottomNav + AuthGuard
│   │   ├── page.tsx                ← Dashboard
│   │   ├── transactions/
│   │   │   ├── page.tsx            ← Liste paginée avec filtres
│   │   │   └── new/page.tsx        ← Formulaire ajout
│   │   ├── objectifs/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── budget/
│   │   │   └── page.tsx
│   │   └── profil/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── manifest.ts
├── components/
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── AmountDisplay.tsx
│   │   ├── BottomNav.tsx
│   │   ├── PageHeader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SkeletonLoader.tsx
│   │   └── Toast.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionItem.tsx
│   │   └── TransactionFilters.tsx
│   ├── objectifs/
│   │   ├── GoalCard.tsx
│   │   ├── GoalForm.tsx
│   │   └── ContributionForm.tsx
│   ├── budget/
│   │   ├── BudgetSummary.tsx
│   │   └── CategoryBudgetItem.tsx
│   └── dashboard/
│       ├── BalanceCard.tsx
│       ├── RecentTransactions.tsx
│       └── SpendingChart.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts               ← initializeApp, getFirestore, getAuth
│   │   ├── auth.ts                 ← signIn, signUp, signOut, onAuthChange
│   │   └── db.ts                   ← helpers Firestore (getDoc, setDoc, query...)
│   ├── services/
│   │   ├── transactionService.ts   ← CRUD + mise à jour des stats dénormalisées
│   │   ├── objectifService.ts
│   │   ├── budgetService.ts
│   │   └── seedService.ts          ← Création comptes/catégories par défaut
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── dates.ts
│   │   └── categories.ts
│   └── validations/
│       ├── transaction.ts
│       └── objectif.ts
├── stores/
│   ├── authStore.ts
│   ├── transactionStore.ts
│   ├── objectifStore.ts
│   └── budgetStore.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useObjectifs.ts
│   └── useBudget.ts
├── types/
│   └── index.ts                    ← Tous les types TypeScript
├── public/
│   └── icons/
├── firestore.rules
├── .firebaserc
├── firebase.json
└── next.config.js
```

---

## Firebase config (`lib/firebase/config.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app
```

---

## Pattern service — Transaction (exemple complet)

```typescript
// lib/services/transactionService.ts
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, Timestamp, writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

// AJOUTER une transaction
// Met à jour en batch : transaction + solde compte + monthlyStats user + budget catégorie
export async function addTransaction(
  userId: string,
  data: CreateTransactionInput
): Promise<string> {
  const batch = writeBatch(db)

  // 1. Créer la transaction
  const txRef = doc(collection(db, `users/${userId}/transactions`))
  batch.set(txRef, {
    ...data,
    createdAt: serverTimestamp(),
    deletedAt: null,
  })

  // 2. Mettre à jour le solde du compte
  const compteRef = doc(db, `users/${userId}/comptes/${data.compteId}`)
  const delta = data.type === 'REVENU' ? data.amount : -data.amount
  batch.update(compteRef, {
    balance: increment(delta)
  })

  // 3. Mettre à jour les stats mensuelles dénormalisées
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

  // 4. Mettre à jour le budget de la catégorie si DEPENSE
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
        spent: increment(data.amount)
      })
    }
  }

  await batch.commit()
  return txRef.id
}

// LISTER les transactions (paginées, 20 par page)
export async function getTransactions(
  userId: string,
  filters: TransactionFilters,
  lastDoc?: DocumentSnapshot
) {
  let q = query(
    collection(db, `users/${userId}/transactions`),
    where('deletedAt', '==', null),
    orderBy('date', 'desc'),
    limit(20)
  )
  if (filters.type) q = query(q, where('type', '==', filters.type))
  if (filters.categoryId) q = query(q, where('categoryId', '==', filters.categoryId))
  if (lastDoc) q = query(q, startAfter(lastDoc))

  const snap = await getDocs(q)
  return {
    transactions: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === 20,
  }
}

// SUPPRIMER (soft delete)
export async function deleteTransaction(
  userId: string,
  transactionId: string,
  transaction: Transaction
) {
  const batch = writeBatch(db)
  
  // Soft delete
  batch.update(doc(db, `users/${userId}/transactions/${transactionId}`), {
    deletedAt: serverTimestamp()
  })

  // Reverser les effets
  const delta = transaction.type === 'REVENU' ? -transaction.amount : transaction.amount
  batch.update(doc(db, `users/${userId}/comptes/${transaction.compteId}`), {
    balance: increment(delta)
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

  await batch.commit()
}
```

---

## Seed à l'inscription (`lib/services/seedService.ts`)

```typescript
// Appelé une fois à la création du compte
export async function seedUserData(userId: string, name: string, email: string) {
  const batch = writeBatch(db)

  // Document user
  batch.set(doc(db, `users/${userId}`), {
    name, email,
    currency: 'XOF',
    monthlyStats: {},
    settings: { currency: 'XOF' },
    createdAt: serverTimestamp(),
  })

  // Comptes par défaut
  const comptes = [
    { name: 'Wave',         type: 'MOBILE_MONEY', balance: 0, isDefault: true,  color: '#1D9E75' },
    { name: 'Orange Money', type: 'MOBILE_MONEY', balance: 0, isDefault: false, color: '#BA7517' },
    { name: 'Espèces',      type: 'ESPECES',      balance: 0, isDefault: false, color: '#888780' },
  ]
  comptes.forEach(c => {
    batch.set(doc(collection(db, `users/${userId}/comptes`)), c)
  })

  // Catégories dépenses par défaut
  const depenses = [
    { name: 'Alimentation', icon: '🛒', color: '#1D9E75', type: 'DEPENSE', isDefault: true },
    { name: 'Transport',    icon: '🚌', color: '#378ADD', type: 'DEPENSE', isDefault: true },
    { name: 'Logement',     icon: '🏠', color: '#BA7517', type: 'DEPENSE', isDefault: true },
    { name: 'Santé',        icon: '💊', color: '#D4537E', type: 'DEPENSE', isDefault: true },
    { name: 'Télécom',      icon: '📱', color: '#639922', type: 'DEPENSE', isDefault: true },
    { name: 'Loisirs',      icon: '🎮', color: '#7F77DD', type: 'DEPENSE', isDefault: true },
    { name: 'Éducation',    icon: '📚', color: '#378ADD', type: 'DEPENSE', isDefault: true },
    { name: 'Autre',        icon: '📦', color: '#888780', type: 'DEPENSE', isDefault: true },
  ]
  const revenus = [
    { name: 'Salaire',   icon: '💰', color: '#1D9E75', type: 'REVENU', isDefault: true },
    { name: 'Freelance', icon: '💻', color: '#378ADD', type: 'REVENU', isDefault: true },
    { name: 'Transfert', icon: '↔️', color: '#BA7517', type: 'REVENU', isDefault: true },
    { name: 'Autre',     icon: '📦', color: '#888780', type: 'REVENU', isDefault: true },
  ]
  ;[...depenses, ...revenus].forEach(cat => {
    batch.set(doc(collection(db, `users/${userId}/categories`)), cat)
  })

  await batch.commit()
}
```

---

## Variables d'environnement

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Design System

### Couleurs (palette fixe)
```
Primaire vert :
  #E1F5EE  (bg léger)
  #1D9E75  (principal — CTAs, accents)
  #0F6E56  (hover, header solde)
  #085041  (texte sur fond vert clair)

Danger corail :
  #FAECE7  (bg alerte)
  #D85A30  (dépenses)
  #993C1D  (texte danger)

Neutre : gray-50 (fond page), white (cartes), gray-200 (bordures 0.5px)
```

### Composants UI à créer dans `components/ui/`
- `Card` — fond blanc, border gray-200 0.5px, radius-xl, padding 16px
- `Badge` — pill sémantique (pos/neg/neutre)
- `ProgressBar` — height 5px, radius full, fill coloré
- `AmountDisplay` — F CFA formaté, couleur vert/rouge selon pos/neg
- `BottomNav` — 5 onglets + FAB vert centré
- `PageHeader` — sticky, titre + action droite
- `EmptyState` — icône + texte + CTA
- `SkeletonLoader` — placeholder animé (pulse)
- `Toast` — feedback bas d'écran, 3s auto-dismiss

### Règles UX mobile
- Tap targets : 44×44px minimum
- Inputs : height 48px, font-size 16px (évite zoom iOS/Android)
- `inputmode="numeric"` sur tous les champs montant
- `padding-bottom: env(safe-area-inset-bottom)` sur BottomNav
- Swipe gauche sur transaction → supprimer (avec confirmation)
- Pull-to-refresh sur les listes (touch events)

---

## Formatage monétaire

```typescript
// lib/utils/currency.ts
export function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' F'
}
// 350000 → "350 000 F"
// 12500  → "12 500 F"
```

---

## Pages

### Auth (`/login`, `/register`)
- Email + password uniquement (Firebase Auth)
- À l'inscription : appeler `seedUserData()` pour créer les données par défaut
- Middleware Next.js pour protéger les routes `(app)`

### Dashboard (`/`)
- `BalanceCard` : solde total (somme des comptes), fond #0F6E56, 2 mini-stats mois courant
- Données lues depuis `users/{userId}.monthlyStats` (1 seule lecture !)
- `RecentTransactions` : 5 dernières (query paginée, limit 5)
- `SpendingChart` : bar chart par catégorie du mois (Recharts)

### Transactions (`/transactions`)
- Liste groupée par date, paginée (20 par page, bouton "Charger plus")
- Chips de filtre : Tout / Dépenses / Revenus + par catégorie
- Swipe gauche → soft delete avec confirmation
- FAB `+` → `/transactions/new`

### Formulaire transaction (`/transactions/new`)
- Toggle Dépense/Revenu
- Input montant grand (32px, inputmode numeric)
- Grille catégories 4 colonnes
- Champs : date, compte (dropdown), note optionnel
- Submit → `addTransaction()` en batch → toast succès → retour liste

### Objectifs (`/objectifs`)
- Liste de GoalCards avec progression
- Détail `/objectifs/[id]` : historique contributions, form contribution rapide, projection date
- Form création : nom, montant cible, deadline, icon, couleur

### Budget (`/budget`)
- Sélecteur mois/année
- 2 métriques : budget total / reste
- Liste catégories avec barres de progression (vert < 80%, amber 80-100%, rouge > 100%)
- Tap catégorie → modifier budget

### Profil (`/profil`)
- Stats utilisateur
- Gestion des comptes (Wave, Orange Money, etc.)
- Catégories personnalisées
- Déconnexion Firebase Auth

---

## PWA

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
      handler: 'NetworkFirst',
      options: { cacheName: 'firestore-cache', networkTimeoutSeconds: 10 },
    },
  ],
})
```

```typescript
// app/manifest.ts
export default function manifest() {
  return {
    name: 'Finperso',
    short_name: 'Finperso',
    description: 'Gérez vos finances personnelles',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0F6E56',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
```

---

## Ordre de développement

1. **Setup** : `create-next-app`, Tailwind, Firebase SDK, next-pwa
2. **Firebase config** : créer projet Firebase console, activer Firestore + Auth email, copier les clés
3. **Firestore rules** : coller les règles de sécurité ci-dessus et publier
4. **Types** : définir tous les types TypeScript dans `types/index.ts`
5. **Auth** : pages login/register, middleware, `seedUserData` à l'inscription
6. **Services** : `transactionService`, `objectifService`, `budgetService`, `seedService`
7. **Composants UI** : Card, Badge, ProgressBar, AmountDisplay, BottomNav, PageHeader, EmptyState, SkeletonLoader, Toast
8. **Transactions** : formulaire + liste paginée
9. **Dashboard** : BalanceCard, RecentTransactions, SpendingChart
10. **Objectifs** : liste, détail, contributions
11. **Budget** : vue mensuelle, modification
12. **Profil** : paramètres, comptes, déconnexion
13. **PWA** : manifest, service worker, test installation Android
14. **Polish** : états vides, skeleton loaders, animations légères

---

## Règles de code

- TypeScript strict, zéro `any`
- Tous les composants sont `"use client"` (Firebase SDK ne fonctionne pas en RSC)
- Le middleware Next.js vérifie le cookie de session Firebase pour protéger les routes
- Toutes les suppressions sont soft delete (`deletedAt`)
- Toutes les écritures multiples passent par `writeBatch` pour garantir l'atomicité
- Toujours try/catch + toast d'erreur sur les appels Firebase
- Les montants sont toujours des `number` entiers (pas de décimales en F CFA)
- Jamais de `console.log` en production (utiliser `process.env.NODE_ENV === 'development'`)
