/**
 * Common Zod Schemas
 *
 * Shared validation patterns used across multiple entities.
 */

import { z } from 'zod';

/**
 * MongoDB ObjectId validation pattern.
 */
export const mongoIdSchema = z
	.string()
	.regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format');

/**
 * Pagination query parameters schema.
 */
export const paginationQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => {
			const parsed = parseInt(val || '1', 10);
			return isNaN(parsed) || parsed < 1 ? 1 : parsed;
		}),
	limit: z
		.string()
		.optional()
		.transform((val) => {
			const parsed = parseInt(val || '10', 10);
			if (isNaN(parsed) || parsed < 1) return 10;
			return Math.min(parsed, 100); // Max 100 items per page
		})
});

/**
 * Geographic coordinates schema.
 */
export const coordinatesSchema = z
	.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180)
	})
	.optional();

/**
 * ID parameter schema for route params.
 */
export const idParamSchema = z.object({
	id: mongoIdSchema
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
