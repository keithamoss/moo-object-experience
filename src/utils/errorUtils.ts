/**
 * Error type utilities and type guards
 */

/**
 * RTK Query error with status and message/data
 */
export interface RTKQueryError {
	status: string | number;
	error?: string;
	data?: unknown;
}

/**
 * Simple error with message
 */
export interface ErrorWithMessage {
	message: string;
}

/**
 * Type guard to check if an error is an RTK Query error
 */
export function isRTKQueryError(error: unknown): error is RTKQueryError {
	return typeof error === 'object' && error !== null && 'status' in error;
}

/**
 * Type guard to check if an error has a message property
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as ErrorWithMessage).message === 'string'
	);
}

/**
 * Format an RTK Query error for display
 */
export function formatRTKQueryError(error: RTKQueryError): string {
	const statusText = `Error ${error.status}`;
	if (error.error) {
		return `${statusText}: ${error.error}`;
	}
	if (error.data) {
		return `${statusText}: ${JSON.stringify(error.data)}`;
	}
	return `${statusText}: Unknown error`;
}

/**
 * Get a display message from any error type
 */
export function getErrorMessage(error: unknown): string {
	if (isRTKQueryError(error)) {
		return formatRTKQueryError(error);
	}
	if (isErrorWithMessage(error)) {
		return error.message;
	}
	return 'An unknown error occurred';
}
