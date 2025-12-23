/**
 * Homestays Controller
 *
 * Handles all CRUD operations for homestay listings.
 */

import { Request, Response } from 'express';
import {
	Homestay,
	CreateHomestayInput,
	UpdateHomestayInput,
	homestaysStore
} from '../models/homestays/Homestay.model';
import {
	sendSuccess,
	sendError,
	getPaginationMeta,
	parsePaginationParams,
	generateId
} from '../utils/response.utils';

/**
 * GET /api/homestays
 *
 * Retrieves all homestays with pagination and optional filters.
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - district: Filter by district name
 * - minPrice: Minimum base price filter
 * - maxPrice: Maximum base price filter
 */
export function getAllHomestays(req: Request, res: Response): void {
	const { page, limit } = parsePaginationParams(
		req.query.page as string,
		req.query.limit as string
	);
	const district = req.query.district as string | undefined;
	const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string, 10) : undefined;
	const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined;

	// Apply filters
	let filtered = homestaysStore.filter(h => h.status === 'active');

	if (district) {
		filtered = filtered.filter(h =>
			h.location.district.toLowerCase() === district.toLowerCase()
		);
	}

	if (minPrice !== undefined) {
		filtered = filtered.filter(h => h.pricing.basePrice >= minPrice);
	}

	if (maxPrice !== undefined) {
		filtered = filtered.filter(h => h.pricing.basePrice <= maxPrice);
	}

	// Paginate results
	const startIndex = (page - 1) * limit;
	const paginatedHomestays = filtered.slice(startIndex, startIndex + limit);

	sendSuccess(res, {
		homestays: paginatedHomestays,
		pagination: getPaginationMeta(page, limit, filtered.length)
	});
}

/**
 * GET /api/homestays/:id
 *
 * Retrieves a single homestay by ID.
 */
export function getHomestayById(req: Request, res: Response): void {
	const { id } = req.params;
	const homestay = homestaysStore.find(h => h._id === id);

	if (!homestay) {
		sendError(res, 'Homestay not found', 404);
		return;
	}

	sendSuccess(res, homestay);
}

/**
 * POST /api/homestays
 *
 * Creates a new homestay listing.
 *
 * Request body: CreateHomestayInput
 */
export function createHomestay(req: Request, res: Response): void {
	const input: CreateHomestayInput = req.body;

	// Basic validation
	const errors = [];
	if (!input.title) {
		errors.push({ field: 'title', message: 'Title is required' });
	}
	if (!input.pricing?.basePrice || input.pricing.basePrice < 100) {
		errors.push({ field: 'pricing.basePrice', message: 'Base price must be at least 100' });
	}

	if (errors.length > 0) {
		sendError(res, 'Validation failed', 400, errors);
		return;
	}

	const now = new Date();
	const newHomestay: Homestay = {
		_id: generateId(),
		...input,
		status: 'active',
		createdAt: now,
		updatedAt: now
	};

	homestaysStore.push(newHomestay);
	sendSuccess(res, newHomestay, 201, 'Homestay created successfully');
}

/**
 * PUT /api/homestays/:id
 *
 * Updates an existing homestay.
 * Supports partial updates.
 *
 * Request body: UpdateHomestayInput
 */
export function updateHomestay(req: Request, res: Response): void {
	const { id } = req.params;
	const updates: UpdateHomestayInput = req.body;

	const index = homestaysStore.findIndex(h => h._id === id);

	if (index === -1) {
		sendError(res, 'Homestay not found', 404);
		return;
	}

	// Merge updates with existing homestay
	const updatedHomestay: Homestay = {
		...homestaysStore[index],
		...updates,
		_id: homestaysStore[index]._id, // Prevent ID modification
		createdAt: homestaysStore[index].createdAt, // Prevent createdAt modification
		updatedAt: new Date()
	};

	homestaysStore[index] = updatedHomestay;
	sendSuccess(res, updatedHomestay, 200, 'Homestay updated successfully');
}

/**
 * DELETE /api/homestays/:id
 *
 * Deletes a homestay listing.
 */
export function deleteHomestay(req: Request, res: Response): void {
	const { id } = req.params;
	const index = homestaysStore.findIndex(h => h._id === id);

	if (index === -1) {
		sendError(res, 'Homestay not found', 404);
		return;
	}

	homestaysStore.splice(index, 1);
	sendSuccess(res, null, 200, 'Homestay deleted successfully');
}
