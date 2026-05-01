import { z } from "zod";

/**
 * Shared Zod schemas. All inputs are trimmed, length-bounded, and type-checked
 * to mitigate XSS/DoS via oversized payloads.
 */

export const tunisianPhoneRegex = /^(\+216|216|0)?\s?[2-9]\d(\s?\d{3}){2}$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "validation.required")
  .email("validation.emailInvalid")
  .max(255, "validation.tooLong");

export const phoneSchema = z
  .string()
  .trim()
  .min(8, "validation.phoneInvalid")
  .max(20, "validation.tooLong")
  .regex(tunisianPhoneRegex, "validation.phoneInvalid");

export const passwordSchema = z
  .string()
  .min(8, "validation.passwordMin")
  .max(128, "validation.tooLong");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "validation.tooShort")
  .max(80, "validation.tooLong");

export const quoteSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "quote.errorMin")
    .max(1000, "quote.errorMax"),
});
export type QuoteFormData = z.infer<typeof quoteSchema>;

export const companyProfileSchema = z.object({
  name: nameSchema,
  description: z.string().trim().min(20).max(500),
  city: z.string().trim().min(2).max(60),
  phone: phoneSchema,
  category: z.string().trim().min(2).max(40),
});
export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(300),
  problems: z.array(z.string().trim().min(3).max(120)).min(1).max(10),
});
export type ServiceFormData = z.infer<typeof serviceSchema>;

export const requestSchema = z.object({
  category: z.string().trim().min(2, "validation.required").max(40),
  city: z.string().trim().min(2, "validation.required").max(60),
  description: z
    .string()
    .trim()
    .min(10, "request.errorMin")
    .max(1000, "request.errorMax"),
  urgency: z.enum(["urgent", "normal"]),
  phone: phoneSchema,
});
export type RequestFormData = z.infer<typeof requestSchema>;
