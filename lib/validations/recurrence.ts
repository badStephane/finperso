import { z } from 'zod'

export const recurrenceSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(40, 'Nom trop long'),
  amount: z
    .number({ error: 'Montant requis' })
    .int('Le montant doit être entier')
    .positive('Le montant doit être positif'),
  type: z.enum(['DEPENSE', 'REVENU']),
  categoryId: z.string().min(1, 'Catégorie requise'),
  compteId: z.string().min(1, 'Compte requis'),
  note: z.string().nullable(),
  dayOfMonth: z.number().int().min(1).max(31),
  nextDueDate: z.date(),
  active: z.boolean(),
})

export type RecurrenceFormData = z.infer<typeof recurrenceSchema>
