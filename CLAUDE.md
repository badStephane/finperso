# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Finperso** is a personal finance PWA for West African users (Senegal priority). Mobile-first, installable on Android, offline-capable, uses franc CFA (F CFA / XOF) currency. All amounts are integers (no decimals).

The project is currently **pre-development** — only a design spec (`finperso_firebase_prompt.md`) and an HTML prototype (`prototype.html`) exist. The spec is the source of truth for architecture, data model, and design decisions.

## Stack

- **Framework**: Next.js 14+ (App Router, TypeScript strict)
- **Backend**: Firebase Spark plan (free tier only) — Firestore + Firebase Auth (email/password)
- **Styling**: Tailwind CSS v3 (mobile-first, no external UI library)
- **State**: Zustand (per-feature stores)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PWA**: next-pwa
- **Icons**: Lucide React only
- **Dates**: date-fns with `fr` locale

## Critical Constraints

- **Firebase Spark plan only (0 cost)**: never enable billing, never use Cloud Functions, never use SMS auth, never use Firebase Extensions
- Firestore daily limits: 50k reads, 20k writes, 20k deletes, 1 GB storage
- All components must be `"use client"` (Firebase SDK doesn't work in RSC)
- All deletions are soft delete (`deletedAt` field)
- All multi-document writes use `writeBatch` for atomicity
- Denormalize aggressively: store precalculated totals in user doc (`monthlyStats`), denormalize category/account names into transactions
- Paginate everything (20 items per page)
- Use `getDocs` for lists, `onSnapshot` only for real-time balance

## Firestore Data Model

All user data lives under `users/{userId}/` with subcollections: `comptes`, `categories`, `transactions`, `objectifs` (with nested `contributions`), `budgets`. The user document contains denormalized `monthlyStats` updated on every transaction via batch writes.

See `finperso_firebase_prompt.md` for the complete schema.

## Architecture

```
app/(auth)/          — login, register pages
app/(app)/           — authenticated pages with BottomNav layout
  page.tsx           — Dashboard
  transactions/      — list + new form
  objectifs/         — savings goals list + detail
  budget/            — monthly budget view
  profil/            — settings, accounts, logout
components/ui/       — shared UI primitives (Card, Badge, BottomNav, Toast, etc.)
components/{feature} — feature-specific components
lib/firebase/        — config.ts, auth.ts, db.ts
lib/services/        — business logic (transactionService, budgetService, etc.)
lib/utils/           — currency formatting, dates, categories
lib/validations/     — Zod schemas
stores/              — Zustand stores per feature
hooks/               — custom React hooks per feature
types/index.ts       — all TypeScript types
```

## Design System

- Primary green: `#E1F5EE` (bg), `#1D9E75` (CTA), `#0F6E56` (hover/header), `#085041` (text on green)
- Danger coral: `#FAECE7` (bg), `#D85A30` (expenses), `#993C1D` (danger text)
- Cards: white bg, gray-200 border 0.5px, rounded-xl, p-4
- Tap targets: 44x44px min; inputs: h-12, text-base (16px to avoid mobile zoom)
- Amount inputs: `inputmode="numeric"`
- BottomNav: 5 tabs + centered green FAB, respects `safe-area-inset-bottom`

## Currency Formatting

```typescript
// Always use: formatCFA(amount) → "350 000 F"
new Intl.NumberFormat('fr-SN', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' F'
```

## Environment Variables

All prefixed `NEXT_PUBLIC_FIREBASE_*`: API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID.

## Build Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run lint         # ESLint
firebase deploy      # deploy to Firebase Hosting
```
