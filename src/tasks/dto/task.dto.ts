import { z } from 'zod';

export const STATUTS = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;
export const PRIORITES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const createTaskSchema = z.strictObject({
  title: z
    .string({ error: 'Le titre est obligatoire' })
    .trim()
    .min(1, 'Le titre est obligatoire'),
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(1, 'La description est obligatoire'),
  priority: z.enum(PRIORITES, {
    error: 'Priorité invalide (LOW, MEDIUM ou HIGH)',
  }),
  status: z
    .enum(STATUTS, { error: 'Statut invalide (TODO, IN_PROGRESS ou COMPLETED)' })
    .optional(),
  due_date: z.coerce.date({ error: 'Date limite invalide' }),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((donnees) => Object.keys(donnees).length > 0, {
    error: 'Aucun champ à modifier',
  });

const optionnel = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

export const listTasksQuerySchema = z.object({
  status: optionnel(z.enum(STATUTS, { error: 'Statut invalide' })),
  priority: optionnel(z.enum(PRIORITES, { error: 'Priorité invalide' })),
  search: optionnel(z.string().trim()),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;