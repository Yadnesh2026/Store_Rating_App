import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const signupSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  password: passwordRule
});

export const createUserSchema = signupSchema.extend({
  role: z.enum(['ADMIN', 'USER', 'OWNER'])
});

export const createStoreSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  ownerId: z.number().int().positive().nullable().optional()
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordRule
});

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5)
});

export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    req.body = parsed.data;
    next();
  };
}
