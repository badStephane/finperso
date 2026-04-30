import { z } from 'zod'

export const transactionSchema = z
  .object({
    amount: z
      .number({ error: 'Montant requis' })
      .int('Le montant doit être entier')
      .positive('Le montant doit être positif'),
    type: z.enum(['DEPENSE', 'REVENU', 'TRANSFERT']),
    categoryId: z.string(),
    compteId: z.string().min(1, 'Compte requis'),
    toCompteId: z.string().nullable(),
    date: z.date(),
    note: z.string().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'TRANSFERT') {
      if (!val.toCompteId) {
        ctx.addIssue({
          code: 'custom',
          path: ['toCompteId'],
          message: 'Compte de destination requis',
        })
      } else if (val.toCompteId === val.compteId) {
        ctx.addIssue({
          code: 'custom',
          path: ['toCompteId'],
          message: 'Choisissez un compte différent',
        })
      }
    } else if (!val.categoryId) {
      ctx.addIssue({
        code: 'custom',
        path: ['categoryId'],
        message: 'Catégorie requise',
      })
    }
  })

export type TransactionFormData = z.infer<typeof transactionSchema>

export const TRANSFER_PSEUDO_CATEGORY = {
  id: '__transfer__',
  name: 'Transfert',
  icon: '↔',
} as const
