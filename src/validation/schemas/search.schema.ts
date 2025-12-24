/**
 * Search Validation Schemas
 *
 * Zod schemas for validating search operations.
 */

import { z } from 'zod';
import { paginationQuerySchema } from './common.schema';

/**
 * Schema for unified search query parameters.
 */
export const searchQuerySchema = paginationQuerySchema.extend({
	q: z.string().min(2, 'Search query must be at least 2 characters'),
	type: z.enum(['all', 'homestays', 'guides', 'products']).default('all')
});

/**
 * Schema for autocomplete query parameters.
 */
export const autocompleteQuerySchema = z.object({
	q: z.string().min(2, 'Search query must be at least 2 characters')
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type AutocompleteQuery = z.infer<typeof autocompleteQuerySchema>;
