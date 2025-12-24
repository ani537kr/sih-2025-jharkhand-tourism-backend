/**
 * Guide Validation Schemas
 *
 * Zod schemas for validating guide CRUD operations.
 */

import { z } from 'zod';
import { paginationQuerySchema } from './common.schema';

/**
 * Location schema for guide.
 */
const locationSchema = z.object({
	district: z.string().min(1, 'District is required').max(100),
	state: z.string().default('Jharkhand')
});

/**
 * Pricing schema for guide services.
 */
const pricingSchema = z.object({
	halfDay: z.number().min(0, 'Half-day price cannot be negative'),
	fullDay: z.number().min(0, 'Full-day price cannot be negative'),
	multiDay: z.number().min(0).optional(),
	workshop: z.number().min(0).optional()
});

/**
 * Schema for creating a new guide profile.
 */
export const createGuideSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	bio: z.string().min(1, 'Bio is required').trim(),
	specializations: z
		.array(z.string())
		.min(1, 'At least one specialization is required'),
	languages: z.array(z.string()).min(1, 'At least one language is required'),
	experience: z.string().min(1, 'Experience is required'),
	location: locationSchema,
	pricing: pricingSchema,
	certifications: z.array(z.string()).optional(),
	availability: z.enum(['available', 'busy', 'unavailable']).default('available')
});

/**
 * Schema for updating an existing guide profile.
 * All fields are optional for partial updates.
 */
export const updateGuideSchema = createGuideSchema.partial();

/**
 * Query parameters for listing guides.
 */
export const guideQuerySchema = paginationQuerySchema.extend({
	specialization: z.string().optional()
});

export type CreateGuideDTO = z.infer<typeof createGuideSchema>;
export type UpdateGuideDTO = z.infer<typeof updateGuideSchema>;
export type GuideQuery = z.infer<typeof guideQuerySchema>;
