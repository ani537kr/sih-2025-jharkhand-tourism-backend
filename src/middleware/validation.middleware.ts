/**
 * Validation Middleware
 *
 * This middleware validates incoming request data using Zod schemas.
 * It runs BEFORE your controller function, ensuring only valid data reaches
 * your business logic.
 *
 * What is Middleware?
 * Middleware functions are like checkpoints in the request-response cycle.
 * They can:
 * - Inspect and modify requests
 * - Decide whether to pass the request to the next handler
 * - Send a response and stop the chain
 *
 * What is Zod?
 * Zod is a TypeScript-first schema validation library. It lets you:
 * - Define the expected shape of your data
 * - Validate data against that shape
 * - Get helpful error messages when validation fails
 * - Transform data during validation (e.g., convert strings to numbers)
 *
 * Why validate input?
 * - Security: Prevent malicious data from reaching your database
 * - Data quality: Ensure data matches expected formats
 * - Error handling: Give users clear feedback about what's wrong
 * - Type safety: TypeScript knows the shape of validated data
 *
 * @module middleware/validation.middleware
 *
 * @example
 * // In a route file
 * import { validate } from '../middleware/validation.middleware';
 * import { createHomestaySchema } from '../validation/schemas/homestay.schema';
 *
 * router.post('/', validate(createHomestaySchema), createHomestay);
 * //                ^^^ This validates req.body before createHomestay runs
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.utils';

/**
 * Which part of the request to validate.
 *
 * - 'body': Request body (POST/PUT data) - most common
 * - 'query': Query string parameters (?page=1&limit=10)
 * - 'params': URL parameters (/homestays/:id where id is a param)
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates a validation middleware for request data.
 *
 * This is a "middleware factory" - a function that returns a middleware function.
 * We use this pattern to customize the middleware with a schema.
 *
 * How it works:
 * 1. Extract data from the specified target (body/query/params)
 * 2. Run the data through the Zod schema
 * 3. If valid: Replace request data with the validated (and possibly transformed) data
 * 4. If invalid: Send a 400 error with details about what went wrong
 *
 * @param schema - A Zod schema that defines what valid data looks like
 * @param target - Which part of the request to validate (default: 'body')
 * @returns An Express middleware function
 *
 * @example
 * // Validate request body (most common use case)
 * router.post('/', validate(createHomestaySchema), createHomestay);
 *
 * @example
 * // Validate query parameters
 * router.get('/', validate(searchQuerySchema, 'query'), searchHomestays);
 *
 * @example
 * // Validate URL parameters
 * router.get('/:id', validate(idParamSchema, 'params'), getHomestayById);
 */
export function validate(
	schema: ZodSchema,
	target: ValidationTarget = 'body'
) {
	/*
	 * Return the actual middleware function.
	 *
	 * This function receives req, res, next from Express
	 * and either:
	 * - Calls next() to pass control to the next middleware/controller
	 * - Sends an error response and stops the chain
	 */
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			/*
			 * Get the data to validate.
			 *
			 * req[target] is shorthand for:
			 * - req.body when target is 'body'
			 * - req.query when target is 'query'
			 * - req.params when target is 'params'
			 */
			const data = req[target];

			/*
			 * Validate using Zod.
			 *
			 * schema.parse() does two things:
			 * 1. Validates the data matches the schema
			 * 2. Returns the data (possibly transformed by schema rules)
			 *
			 * If validation fails, it throws a ZodError.
			 */
			const validated = schema.parse(data);

			/*
			 * Replace original data with validated data.
			 *
			 * Why? Because Zod can transform data during validation:
			 * - Trim whitespace from strings
			 * - Convert string "5" to number 5
			 * - Set default values for missing fields
			 *
			 * By replacing req.body with validated data, the controller
			 * gets clean, typed data to work with.
			 */
			if (target === 'body') {
				req.body = validated;
			} else if (target === 'query') {
				/*
				 * TypeScript doesn't allow direct assignment to req.query
				 * because it's typed as ParsedQs (from query-string parser).
				 * Object.assign works around this.
				 */
				Object.assign(req.query, validated);
			} else if (target === 'params') {
				Object.assign(req.params, validated);
			}

			/*
			 * Validation passed! Continue to the next middleware/controller.
			 *
			 * Calling next() passes control to the next function in the chain.
			 */
			next();
		} catch (error) {
			/*
			 * Handle Zod validation errors.
			 *
			 * ZodError contains an array of 'issues' - each issue describes
			 * one validation problem (which field, what's wrong).
			 */
			if (error instanceof ZodError) {
				/*
				 * Transform Zod's error format to our API's format.
				 *
				 * Zod provides:
				 * - issue.path: Array like ['location', 'district'] for nested fields
				 * - issue.message: Human-readable error message
				 *
				 * We join the path with '.' to get field names like 'location.district'
				 */
				const validationErrors = error.issues.map((issue) => ({
					field: issue.path.join('.'),
					message: issue.message
				}));

				/*
				 * Send 400 Bad Request with error details.
				 *
				 * We don't call next() here - the request stops and
				 * the controller never runs.
				 */
				sendError(res, 'Validation failed', 400, validationErrors);
				return;
			}

			/*
			 * If it's not a ZodError, something unexpected happened.
			 * Pass the error to Express's error handler.
			 */
			next(error);
		}
	};
}

/**
 * Validates multiple parts of the request at once.
 *
 * Use this when you need to validate both URL params and body,
 * or body and query, etc.
 *
 * @param schemas - Object mapping targets to their Zod schemas
 * @returns Express middleware function
 *
 * @example
 * // Validate both URL params and request body
 * router.put('/:id',
 *   validateMultiple({
 *     params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
 *     body: updateHomestaySchema
 *   }),
 *   updateHomestay
 * );
 */
export function validateMultiple(
	schemas: Partial<Record<ValidationTarget, ZodSchema>>
) {
	return (req: Request, res: Response, next: NextFunction): void => {
		/*
		 * Collect all validation errors from all targets.
		 * This way, the user sees all problems at once, not one at a time.
		 */
		const allErrors: Array<{ field: string; message: string }> = [];

		/*
		 * Iterate through each target/schema pair.
		 *
		 * Object.entries converts { body: schema1, params: schema2 }
		 * to [['body', schema1], ['params', schema2]]
		 */
		for (const [target, schema] of Object.entries(schemas)) {
			if (!schema) continue;

			try {
				const data = req[target as ValidationTarget];
				const validated = schema.parse(data);

				// Update request with validated data
				if (target === 'body') {
					req.body = validated;
				} else if (target === 'query') {
					Object.assign(req.query, validated);
				} else if (target === 'params') {
					Object.assign(req.params, validated);
				}
			} catch (error) {
				if (error instanceof ZodError) {
					/*
					 * Prefix field names with the target (e.g., 'body.email')
					 * so users know which part of the request has the error.
					 */
					const errors = error.issues.map((issue) => ({
						field: `${target}.${issue.path.join('.')}`,
						message: issue.message
					}));
					allErrors.push(...errors);
				} else {
					// Unexpected error - let Express handle it
					next(error);
					return;
				}
			}
		}

		// If any validation errors occurred, send them all
		if (allErrors.length > 0) {
			sendError(res, 'Validation failed', 400, allErrors);
			return;
		}

		// All validations passed
		next();
	};
}

/**
 * Sanitizes a string to prevent XSS (Cross-Site Scripting) attacks.
 *
 * XSS attacks happen when malicious scripts are injected into your
 * application. For example, someone might try to submit:
 *   <script>stealCookies()</script>
 *
 * This function escapes HTML special characters so they display
 * as text instead of being executed as code.
 *
 * @param input - The string to sanitize
 * @returns The sanitized string with HTML characters escaped
 *
 * @example
 * sanitizeString('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
 */
export function sanitizeString(input: string): string {
	return input
		.replace(/</g, '&lt;') // < becomes &lt;
		.replace(/>/g, '&gt;') // > becomes &gt;
		.replace(/"/g, '&quot;') // " becomes &quot;
		.replace(/'/g, '&#x27;') // ' becomes &#x27;
		.replace(/\//g, '&#x2F;') // / becomes &#x2F;
		.trim(); // Remove leading/trailing whitespace
}

/**
 * Recursively sanitizes all string values in an object.
 *
 * This is useful when you have nested objects (like our homestay
 * with location.address) and want to sanitize every string field.
 *
 * The function uses recursion - it calls itself for nested objects
 * and arrays until it reaches individual string values.
 *
 * @param obj - Object, array, string, or other value to sanitize
 * @returns The sanitized version (same structure, strings escaped)
 *
 * @example
 * sanitizeObject({
 *   name: '<script>alert("xss")</script>',
 *   nested: { value: '<b>bold</b>' }
 * })
 * // Returns: {
 * //   name: '&lt;script&gt;...',
 * //   nested: { value: '&lt;b&gt;bold&lt;/b&gt;' }
 * // }
 */
export function sanitizeObject<T>(obj: T): T {
	/*
	 * Base case 1: If it's a string, sanitize and return it.
	 */
	if (typeof obj === 'string') {
		return sanitizeString(obj) as T;
	}

	/*
	 * Recursive case 1: If it's an array, sanitize each element.
	 *
	 * We use map() to create a new array with sanitized values.
	 */
	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeObject(item)) as T;
	}

	/*
	 * Recursive case 2: If it's an object, sanitize each property.
	 *
	 * We create a new object and recursively sanitize each value.
	 */
	if (obj && typeof obj === 'object') {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			sanitized[key] = sanitizeObject(value);
		}
		return sanitized as T;
	}

	/*
	 * Base case 2: For other types (numbers, booleans, null, undefined),
	 * just return as-is. These can't contain script tags.
	 */
	return obj;
}
