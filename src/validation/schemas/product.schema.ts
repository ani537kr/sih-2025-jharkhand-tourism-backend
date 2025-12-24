/**
 * Product Validation Schemas
 *
 * Zod schemas for validating product CRUD operations.
 */

import { z } from 'zod';
import { paginationQuerySchema } from './common.schema';

/**
 * Pricing schema for product.
 */
const pricingSchema = z.object({
	amount: z.number().min(0, 'Price cannot be negative'),
	originalAmount: z.number().min(0).optional(),
	discount: z.number().min(0).max(100, 'Discount cannot exceed 100%').optional()
});

/**
 * Schema for creating a new product.
 */
export const createProductSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(200, 'Title must be less than 200 characters')
		.trim(),
	description: z.string().min(1, 'Description is required').trim(),
	category: z.string().min(1, 'Category is required').trim(),
	subcategory: z.string().trim().optional(),
	price: pricingSchema,
	stock: z.number().min(0, 'Stock cannot be negative').default(0),
	images: z.array(z.string().url('Invalid image URL')).default([]),
	specifications: z.record(z.string(), z.string()).optional()
});

/**
 * Schema for updating an existing product.
 * All fields are optional for partial updates.
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Query parameters for listing products.
 */
export const productQuerySchema = paginationQuerySchema.extend({
	category: z.string().optional()
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
