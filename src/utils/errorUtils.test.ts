/**
 * Tests for error utility functions
 */

import { describe, expect, it } from 'vitest';
import {
	formatRTKQueryError,
	getErrorMessage,
	isErrorWithMessage,
	isRTKQueryError,
	type RTKQueryError,
} from './errorUtils';

describe('isRTKQueryError', () => {
	it('should return true for objects with a status property', () => {
		expect(isRTKQueryError({ status: 200 })).toBe(true);
		expect(isRTKQueryError({ status: 429, error: 'Too many requests' })).toBe(true);
		expect(isRTKQueryError({ status: 'FETCH_ERROR' })).toBe(true);
	});

	it('should return false for a plain Error instance', () => {
		expect(isRTKQueryError(new Error('oops'))).toBe(false);
	});

	it('should return false for a plain string', () => {
		expect(isRTKQueryError('some error string')).toBe(false);
	});

	it('should return false for null', () => {
		expect(isRTKQueryError(null)).toBe(false);
	});

	it('should return false for undefined', () => {
		expect(isRTKQueryError(undefined)).toBe(false);
	});

	it('should return false for an object without a status property', () => {
		expect(isRTKQueryError({ message: 'no status here' })).toBe(false);
	});
});

describe('isErrorWithMessage', () => {
	it('should return true for objects with a string message property', () => {
		expect(isErrorWithMessage({ message: 'something went wrong' })).toBe(true);
		expect(isErrorWithMessage(new Error('native error'))).toBe(true);
	});

	it('should return false for objects without a message property', () => {
		expect(isErrorWithMessage({ status: 404 })).toBe(false);
		expect(isErrorWithMessage({})).toBe(false);
	});

	it('should return false for objects with a non-string message', () => {
		expect(isErrorWithMessage({ message: 42 })).toBe(false);
		expect(isErrorWithMessage({ message: null })).toBe(false);
	});

	it('should return false for null and primitives', () => {
		expect(isErrorWithMessage(null)).toBe(false);
		expect(isErrorWithMessage('error string')).toBe(false);
		expect(isErrorWithMessage(404)).toBe(false);
	});
});

describe('formatRTKQueryError', () => {
	it('should format status + error string: "Error 429: Too many requests"', () => {
		const err: RTKQueryError = { status: 429, error: 'Too many requests' };
		expect(formatRTKQueryError(err)).toBe('Error 429: Too many requests');
	});

	it('should fall back to stringified data when there is no error string', () => {
		const err: RTKQueryError = { status: 404, data: { message: 'Not found' } };
		expect(formatRTKQueryError(err)).toBe('Error 404: {"message":"Not found"}');
	});

	it('should return "Error {status}: Unknown error" when neither error nor data is present', () => {
		const err: RTKQueryError = { status: 500 };
		expect(formatRTKQueryError(err)).toBe('Error 500: Unknown error');
	});

	it('should use string status values as-is', () => {
		const err: RTKQueryError = { status: 'FETCH_ERROR', error: 'Network request failed' };
		expect(formatRTKQueryError(err)).toBe('Error FETCH_ERROR: Network request failed');
	});
});

describe('getErrorMessage', () => {
	it('should format RTK Query errors via formatRTKQueryError', () => {
		const err = { status: 429, error: 'Too many requests' };
		expect(getErrorMessage(err)).toBe('Error 429: Too many requests');
	});

	it('should return the message for plain Error instances', () => {
		expect(getErrorMessage(new Error('something broke'))).toBe('something broke');
	});

	it('should return the message for objects with a string message', () => {
		expect(getErrorMessage({ message: 'custom message' })).toBe('custom message');
	});

	it('should return the fallback string for completely unknown errors', () => {
		expect(getErrorMessage(42)).toBe('An unknown error occurred');
		expect(getErrorMessage(null)).toBe('An unknown error occurred');
		expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
	});
});
