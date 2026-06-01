
import { z } from 'zod'

export const AddCartItemSchema = z.object({
  variant_id: z
    .string({ required_error: 'variant_id is required.' })
    .uuid('variant_id must be a valid UUID.'),
  quantity: z
    .number({ required_error: 'quantity is required.' })
    .int('quantity must be an integer.')
    .min(1, 'quantity must be at least 1.')
    .max(9999, 'quantity cannot exceed 9,999 units.'), // INCREASED LIMIT
})

export const UpdateCartItemSchema = z.object({
  quantity: z
    .number({ required_error: 'quantity is required.' })
    .int('quantity must be an integer.')
    .min(0, 'quantity cannot be negative.')
    .max(9999, 'quantity cannot exceed 9,999 units.'), // INCREASED LIMIT
})
