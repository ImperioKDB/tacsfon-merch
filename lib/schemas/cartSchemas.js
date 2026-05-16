import { z } from 'zod'

export const AddCartItemSchema = z.object({
  variant_id: z
    .string({ required_error: 'variant_id is required.' })
    .uuid('variant_id must be a valid UUID.'),
  quantity: z
    .number({ required_error: 'quantity is required.' })
    .int('quantity must be an integer.')
    .min(1, 'quantity must be at least 1.')
    .max(20, 'quantity cannot exceed 20.'),
})

export const UpdateCartItemSchema = z.object({
  quantity: z
    .number({ required_error: 'quantity is required.' })
    .int('quantity must be an integer.')
    .min(0, 'quantity cannot be negative.')
    .max(20, 'quantity cannot exceed 20.'),
})
