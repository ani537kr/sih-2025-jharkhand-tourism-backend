/**
 * Booking Validation Schemas
 *
 * Zod schemas for validating booking operations.
 */

import { z } from 'zod';
import { mongoIdSchema, paginationQuerySchema } from './common.schema';

/**
 * Guest count schema.
 */
const guestCountSchema = z.object({
	adults: z.number().min(1, 'At least 1 adult is required'),
	children: z.number().min(0).default(0)
});

/**
 * Guest details schema.
 */
const guestDetailsSchema = z.object({
	name: z.string().min(1, 'Guest name is required').trim(),
	email: z.string().email('Invalid email format').toLowerCase(),
	phone: z.string().min(10, 'Phone must be at least 10 digits').max(15)
});

/**
 * Pricing schema for booking.
 */
const pricingSchema = z.object({
	basePrice: z.number().min(0, 'Base price cannot be negative'),
	cleaningFee: z.number().min(0).optional(),
	serviceFee: z.number().min(0).optional(),
	taxes: z.number().min(0).optional(),
	total: z.number().min(0, 'Total cannot be negative')
});

/**
 * Date string regex pattern (YYYY-MM-DD or ISO 8601).
 */
const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;

/**
 * Schema for creating a new booking.
 */
export const createBookingSchema = z
	.object({
		listingType: z.enum(['homestay', 'guide'], {
			message: 'Listing type must be homestay or guide'
		}),
		listingId: mongoIdSchema,
		checkIn: z.string().regex(datePattern, 'Invalid check-in date format'),
		checkOut: z.string().regex(datePattern, 'Invalid check-out date format'),
		guests: guestCountSchema,
		guestDetails: guestDetailsSchema,
		specialRequests: z.string().max(1000).optional(),
		pricing: pricingSchema
	})
	.refine(
		(data) => {
			const checkIn = new Date(data.checkIn);
			const checkOut = new Date(data.checkOut);
			return checkOut > checkIn;
		},
		{
			message: 'Check-out must be after check-in',
			path: ['checkOut']
		}
	)
	.refine(
		(data) => {
			const checkIn = new Date(data.checkIn);
			const now = new Date();
			now.setHours(0, 0, 0, 0);
			return checkIn >= now;
		},
		{
			message: 'Check-in date must be today or in the future',
			path: ['checkIn']
		}
	);

/**
 * Schema for canceling a booking.
 */
export const cancelBookingSchema = z.object({
	reason: z.string().max(500).optional()
});

/**
 * Query parameters for listing bookings.
 */
export const bookingQuerySchema = paginationQuerySchema.extend({
	status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional()
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
export type CancelBookingDTO = z.infer<typeof cancelBookingSchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
