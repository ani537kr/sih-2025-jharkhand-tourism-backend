/**
 * Validation Module
 *
 * Exports all validation schemas for use throughout the application.
 */

// Common schemas
export {
	mongoIdSchema,
	paginationQuerySchema,
	coordinatesSchema,
	idParamSchema,
	type PaginationQuery,
	type Coordinates
} from './schemas/common.schema';

// Homestay schemas
export {
	createHomestaySchema,
	updateHomestaySchema,
	homestayQuerySchema,
	type CreateHomestayDTO,
	type UpdateHomestayDTO,
	type HomestayQuery
} from './schemas/homestay.schema';

// Guide schemas
export {
	createGuideSchema,
	updateGuideSchema,
	guideQuerySchema,
	type CreateGuideDTO,
	type UpdateGuideDTO,
	type GuideQuery
} from './schemas/guide.schema';

// Product schemas
export {
	createProductSchema,
	updateProductSchema,
	productQuerySchema,
	type CreateProductDTO,
	type UpdateProductDTO,
	type ProductQuery
} from './schemas/product.schema';

// Booking schemas
export {
	createBookingSchema,
	cancelBookingSchema,
	bookingQuerySchema,
	type CreateBookingDTO,
	type CancelBookingDTO,
	type BookingQuery
} from './schemas/booking.schema';

// Search schemas
export {
	searchQuerySchema,
	autocompleteQuerySchema,
	type SearchQuery,
	type AutocompleteQuery
} from './schemas/search.schema';

// Auth schemas
export {
	registerSchema,
	loginSchema,
	updateProfileSchema,
	type RegisterDTO,
	type LoginDTO,
	type UpdateProfileDTO
} from './schemas/auth.schema';
