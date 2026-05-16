/**
 * lib/schemas/productSchemas.js
 * Zod schemas for product and variant request bodies.
 */
import { z } from 'zod'

export const CreateProductSchema = z.object({
  name: z
    .string({ required_error: 'name is required.' })
    .min(2, 'name must be at least 2 characters.')
    .max(200, 'name must be under 200 characters.'),
  description: z
    .string()
    .max(2000, 'description must be under 2000 characters.')
    .optional()
    .nullable(),
  base_price: z
    .number({ required_error: 'base_price is required.' })
    .positive('base_price must be a positive number.'),
  category_id: z
    .string({ required_error: 'category_id is required.' })
    .uuid('category_id must be a valid UUID.'),
  stock_type: z
    .enum(['stock', 'preorder', 'both'], {
      errorMap: () => ({ message: "stock_type must be 'stock', 'preorder', or 'both'." }),
    })
    .default('stock'),
  is_available: z.boolean().default(true),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export const CreateVariantSchema = z.object({
  size: z
    .string()
    .max(50, 'size must be under 50 characters.')
    .optional()
    .nullable(),
  color: z
    .string()
    .max(50, 'color must be under 50 characters.')
    .optional()
    .nullable(),
  stock_qty: z
    .number({ required_error: 'stock_qty is required.' })
    .int('stock_qty must be an integer.')
    .min(0, 'stock_qty cannot be negative.'),
  price_override: z
    .number()
    .positive('price_override must be a positive number.')
    .optional()
    .nullable(),
})

export const UpdateVariantSchema = CreateVariantSchema.partial()
