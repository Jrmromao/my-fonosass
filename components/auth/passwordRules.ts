import { z } from 'zod';

// Single password policy for sign-up and password reset.
export const PASSWORD_HINT =
  'Mínimo de 8 caracteres, com letra maiúscula, minúscula e número.';

export const passwordSchema = z
  .string()
  .min(8, PASSWORD_HINT)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, PASSWORD_HINT);
