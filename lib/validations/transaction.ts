import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z
    .number({ error: 'Montant requis' })
    .int('Le montant doit être entier')
    .positive('Le montant doit être positif'),
  type: z.enum(['DEPENSE', 'REVENU']),
  categoryId: z.string().min(1, 'Catégorie requise'),
  compteId: z.string().min(1, 'Compte requis'),
  date: z.date(),
  note: z.string().nullable(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
