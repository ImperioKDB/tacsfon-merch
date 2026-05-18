/**
 * schemas — Zod validation schemas for every endpoint family
 *
 * Import and parse in your route handlers:
 *
 *   import { cartAddSchema } from '@/lib/validation/schemas'
 *   const { data, error } = await validateBody(req, cartAddSchema)
 *   if (error) return error
 *
 * Never trust numeric, enum, UUID, or file values from the client
 * without running them through one of these schemas first.
 */
import { z } from 'zod'

// ── Shared primitives ────────────────────────────────────────────────────────

export const uuidSchema  = z.string().uuid({ message: 'Invalid ID format.' })
export const emailSchema = z.string().email({ message: 'Invalid email address.' })

const positiveInt = (label: string) =>
  z.number({ invalid_type_error: `${label} must be a number.` }).int().positive()

// ── Auth ─────────────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email:    emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
})

export const signUpSchema = signInSchema.extend({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must be under 100 characters.'),
})

// ── Cart ─────────────────────────────────────────────────────────────────────

export const cartAddSchema = z.object({
  variant_id: uuidSchema,
  quantity:   z
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .min(1,  'Quantity must be at least 1.')
    .max(99, 'Maximum quantity per item is 99.'),
})

export const cartUpdateSchema = z.object({
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .min(1,  'Quantity must be at least 1.')
    .max(99, 'Maximum quantity per item is 99.'),
})

// ── Orders ───────────────────────────────────────────────────────────────────

export const orderCreateSchema = z
  .object({
    delivery_type: z.enum(['pickup', 'delivery'], {
      invalid_type_error: "Delivery type must be 'pickup' or 'delivery'.",
    }),
    notes:   z.string().max(500, 'Notes must be under 500 characters.').optional(),
    address: z.string().max(300, 'Address must be under 300 characters.').optional(),
  })
  .refine(
    data => data.delivery_type !== 'delivery' || Boolean(data.address?.trim()),
    { message: 'A delivery address is required for delivery orders.', path: ['address'] }
  )

export const orderReceivedSchema = z.object({
  confirmed: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm that you received the order.' }),
  }),
})

// ── Walk-in orders ───────────────────────────────────────────────────────────

export const walkinOrderSchema = z.object({
  items: z
    .array(
      z.object({
        variant_id: uuidSchema,
        quantity:   z.number().int().min(1).max(99),
      })
    )
    .min(1, 'At least one item is required.'),
  notes:         z.string().max(500).optional(),
  customer_name: z.string().max(100).optional(),
})

// ── Payment ──────────────────────────────────────────────────────────────────

export const paymentConfirmSchema = z.object({
  action: z.enum(['confirm', 'reject'], {
    invalid_type_error: "Action must be 'confirm' or 'reject'.",
  }),
  reason: z.string().max(300, 'Reason must be under 300 characters.').optional(),
})

// ── Admin — Products ─────────────────────────────────────────────────────────

const STOCK_TYPES = ['instock', 'preorder', 'made_to_order'] as const

export const productCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters.')
    .max(200, 'Product name must be under 200 characters.'),
  description:  z.string().max(2000, 'Description must be under 2000 characters.').optional(),
  base_price:   z
    .number({ invalid_type_error: 'Base price must be a number.' })
    .positive('Base price must be a positive number.'),
  category_id:  uuidSchema,
  stock_type:   z.enum(STOCK_TYPES, {
    invalid_type_error: `Stock type must be one of: ${STOCK_TYPES.join(', ')}.`,
  }),
  is_available: z.boolean().default(true),
})

// All fields optional for PATCH
export const productUpdateSchema = productCreateSchema.partial()

export const variantCreateSchema = z.object({
  size:           z.string().max(20, 'Size label must be under 20 characters.').optional(),
  color:          z.string().max(30, 'Color name must be under 30 characters.').optional(),
  stock_qty:      z
    .number({ invalid_type_error: 'Stock quantity must be a number.' })
    .int()
    .min(0, 'Stock quantity cannot be negative.'),
  price_override: z
    .number({ invalid_type_error: 'Price override must be a number.' })
    .positive('Price override must be a positive number.')
    .nullable()
    .optional(),
})

export const variantUpdateSchema = variantCreateSchema.partial()

// ── Admin — Categories ───────────────────────────────────────────────────────

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters.')
    .max(100, 'Category name must be under 100 characters.'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      'Slug may only contain lowercase letters, numbers, and hyphens.'
    )
    .max(100, 'Slug must be under 100 characters.'),
})

// ── Admin — Admin accounts ───────────────────────────────────────────────────

export const adminCreateSchema = z.object({
  email:     emailSchema,
  full_name: z.string().min(2).max(100),
  password:  z
    .string()
    .min(8,  'Admin password must be at least 8 characters.')
    .max(128, 'Admin password must be under 128 characters.'),
})

// ── Logs query (GET /api/admin/logs) ─────────────────────────────────────────

export const logsQuerySchema = z.object({
  admin_id: uuidSchema.optional(),
  action:   z.string().max(50).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
})
