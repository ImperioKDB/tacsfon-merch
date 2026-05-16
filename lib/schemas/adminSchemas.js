import { z } from 'zod'

export const WalkinOrderSchema = z.object({
  customer_name: z
    .string({ required_error: 'customer_name is required.' })
    .min(2).max(200),
  phone: z
    .string({ required_error: 'phone is required.' })
    .regex(/^[0-9+\-\s]{7,20}$/, 'phone must be a valid phone number.'),
  delivery_address: z.string().max(500).optional().nullable(),
  items: z
    .array(z.object({
      product_id: z.string().uuid('product_id must be a valid UUID.'),
      variant_id: z.string().uuid('variant_id must be a valid UUID.'),
      quantity:   z.number().int().min(1),
    }))
    .min(1, 'items must contain at least one item.'),
})

export const UpdatePaymentStatusSchema = z.object({
  payment_status: z.enum(['paid', 'incomplete'], {
    errorMap: () => ({ message: "payment_status must be 'paid' or 'incomplete'." }),
  }),
})

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['dispatched'], {
    errorMap: () => ({ message: "status must be 'dispatched'." }),
  }),
})

export const CreateAdminSchema = z.object({
  email: z.string({ required_error: 'email is required.' }).email(),
})

export const CreateCategorySchema = z.object({
  name: z.string({ required_error: 'name is required.' }).min(2).max(100),
})
