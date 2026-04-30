import { z } from 'zod'

export const objectifSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(50, '50 caractères max'),
  targetAmount: z
    .number({ error: 'Montant requis' })
    .int('Le montant doit être entier')
    .positive('Le montant doit être positif'),
  deadline: z.date().nullable(),
  icon: z.string().min(1),
  color: z.string().min(1),
})

export const contributionSchema = z.object({
  amount: z
    .number({ error: 'Montant requis' })
    .int('Le montant doit être entier')
    .positive('Le montant doit être positif'),
  note: z.string().nullable(),
})

export type ObjectifFormData = z.infer<typeof objectifSchema>
export type ContributionFormData = z.infer<typeof contributionSchema>
