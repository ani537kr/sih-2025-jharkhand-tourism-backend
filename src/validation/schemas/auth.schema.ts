/**
 * Authentication Validation Schemas
 *
 * Zod schemas for validating authentication operations.
 */

import { z } from 'zod';

/**
 * Password validation rules.
 */
const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Schema for user registration.
 */
export const registerSchema = z.object({
	email: z.string().email('Invalid email format').toLowerCase().trim(),
	password: passwordSchema,
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	role: z.enum(['host', 'guide', 'customer']).default('customer')
});

/**
 * Schema for user login.
 */
export const loginSchema = z.object({
	email: z.string().email('Invalid email format').toLowerCase().trim(),
	password: z.string().min(1, 'Password is required')
});

/**
 * Schema for updating user profile.
 */
export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim()
		.optional(),
	currentPassword: z.string().optional(),
	newPassword: passwordSchema.optional()
}).refine(
	(data) => {
		// If changing password, current password is required
		if (data.newPassword && !data.currentPassword) {
			return false;
		}
		return true;
	},
	{
		message: 'Current password is required to set a new password',
		path: ['currentPassword']
	}
);

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
