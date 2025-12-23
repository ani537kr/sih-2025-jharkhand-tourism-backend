/**
 * Counter Model
 *
 * Provides auto-incrementing sequence numbers for booking IDs.
 * Uses MongoDB's findOneAndUpdate with $inc for atomic increments.
 */

import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';

/**
 * Counter document interface.
 */
export interface ICounter {
	_id: string;  // Counter name (e.g., 'bookingNumber')
	seq: number;  // Current sequence value
}

/**
 * Counter document type.
 */
export type ICounterDocument = HydratedDocument<ICounter>;

// ============================================================================
// Mongoose Schema
// ============================================================================

const counterSchema = new Schema<ICounter>({
	_id: { type: String, required: true },
	seq: { type: Number, default: 1000 }
}, {
	collection: 'counters',
	_id: false // We're defining _id ourselves
});

/**
 * Counter Mongoose model.
 */
export const CounterModel: Model<ICounter> = mongoose.model<ICounter>('Counter', counterSchema);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the next booking number in sequence.
 *
 * Uses atomic findOneAndUpdate to ensure unique booking numbers
 * even under concurrent requests.
 *
 * @returns Promise<string> Formatted booking number (e.g., "JY-2025-001234")
 */
export async function getNextBookingNumber(): Promise<string> {
	const year = new Date().getFullYear();

	const counter = await CounterModel.findOneAndUpdate(
		{ _id: 'bookingNumber' },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true }
	);

	const sequenceNumber = counter.seq.toString().padStart(6, '0');
	return `JY-${year}-${sequenceNumber}`;
}
