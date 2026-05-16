/**
 * lib/schemas/orderSchemas.js
 * Zod schemas for order-related request bodies.
 */
import { z } from 'zod'

export const PlaceOrderSchema = z.object({
  delivery_address: z
    .string()
    .max(500, 'delivery_address must be under 500 characters.')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{7,20}$/, 'phone must be a valid phone number.')
    .optional()
    .nullable(),
})

export const MarkReceivedSchema = z.object({}).optional()
