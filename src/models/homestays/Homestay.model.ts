/**
 * Homestay Model
 *
 * Defines the Homestay entity structure and provides in-memory storage.
 * Homestays represent accommodation listings available for booking.
 */

import { Location } from '../../types/api.types';

/**
 * Property type options for homestays.
 * - entire: Entire property rental
 * - private: Private room within a property
 * - shared: Shared space
 */
export type PropertyType = 'entire' | 'private' | 'shared';

/**
 * Homestay listing status.
 * - active: Available for booking
 * - inactive: Temporarily unavailable
 * - pending: Awaiting approval
 */
export type HomestayStatus = 'active' | 'inactive' | 'pending';

/**
 * Pricing structure for homestays.
 */
export interface HomestayPricing {
	basePrice: number;
	cleaningFee?: number;
	weekendPrice?: number;
}

/**
 * Capacity details for a homestay.
 */
export interface HomestayCapacity {
	guests: number;
	bedrooms: number;
	beds: number;
	bathrooms: number;
}

/**
 * Complete Homestay entity interface.
 */
export interface Homestay {
	_id: string;
	title: string;
	description: string;
	propertyType: PropertyType;
	location: Location;
	pricing: HomestayPricing;
	capacity: HomestayCapacity;
	amenities: string[];
	houseRules?: string[];
	images: string[];
	status: HomestayStatus;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Input type for creating a new homestay.
 * Excludes auto-generated fields.
 */
export type CreateHomestayInput = Omit<Homestay, '_id' | 'status' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for updating a homestay.
 * All fields are optional.
 */
export type UpdateHomestayInput = Partial<Omit<Homestay, '_id' | 'createdAt' | 'updatedAt'>>;

/**
 * In-memory storage for homestays.
 * In production, this would be replaced by a database.
 */
export const homestaysStore: Homestay[] = [];