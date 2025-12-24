/**
 * Homestay Validation Schemas
 *
 * Zod schemas for validating homestay CRUD operations.
 */

import { z } from 'zod';
import { coordinatesSchema, paginationQuerySchema } from './common.schema';

/**
 * Location schema for homestay.
 */
const locationSchema = z.object({
	address: z.string().min(1, 'Address is required').max(500),
	district: z.string().min(1, 'District is required').max(100),
	state: z.string().default('Jharkhand'),
	coordinates: coordinatesSchema
});

/**
 * Pricing schema for homestay.
 */
const pricingSchema = z.object({
	basePrice: z.number().min(100, 'Base price must be at least 100'),
	cleaningFee: z.number().min(0).optional(),
	weekendPrice: z.number().min(0).optional()
});

/**
 * Capacity schema for homestay.
 */
const capacitySchema = z.object({
	guests: z.number().min(1, 'At least 1 guest capacity required'),
	bedrooms: z.number().min(0),
	beds: z.number().min(1, 'At least 1 bed required'),
	bathrooms: z.number().min(0)
});

/**
 * Schema for creating a new homestay.
 */
export const createHomestaySchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(200, 'Title must be less than 200 characters')
		.trim(),
	description: z.string().min(1, 'Description is required').trim(),
	propertyType: z.enum(['entire', 'private', 'shared']),
	location: locationSchema,
	pricing: pricingSchema,
	capacity: capacitySchema,
	amenities: z.array(z.string()).default([]),
	houseRules: z.array(z.string()).optional(),
	images: z.array(z.string().url('Invalid image URL')).default([])
});

/**
 * Schema for updating an existing homestay.
 * All fields are optional for partial updates.
 */
export const updateHomestaySchema = createHomestaySchema.partial().extend({
	status: z.enum(['active', 'inactive', 'pending']).optional()
});

/**
 * Query parameters for listing homestays.
 */
export const homestayQuerySchema = paginationQuerySchema.extend({
	district: z.string().optional(),
	minPrice: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : undefined)),
	maxPrice: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : undefined))
});

export type CreateHomestayDTO = z.infer<typeof createHomestaySchema>;
export type UpdateHomestayDTO = z.infer<typeof updateHomestaySchema>;
export type HomestayQuery = z.infer<typeof homestayQuerySchema>;
