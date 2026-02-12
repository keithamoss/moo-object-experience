import { describe, expect, it } from 'vitest';
import { formatDate } from './dateUtils';

describe('formatDate', () => {
	it('should format full ISO dates correctly', () => {
		expect(formatDate('2024-01-15')).toBe('15 January 2024');
		expect(formatDate('2023-12-25')).toBe('25 December 2023');
		expect(formatDate('2025-06-01')).toBe('1 June 2025');
	});

	it('should handle year-month format', () => {
		expect(formatDate('2024-01')).toBe('January 2024');
		expect(formatDate('2023-12')).toBe('December 2023');
		expect(formatDate('2025-06')).toBe('June 2025');
	});

	it('should handle year-only format', () => {
		expect(formatDate('2024')).toBe('2024');
		expect(formatDate('1999')).toBe('1999');
	});

	it('should strip time component from ISO timestamps', () => {
		expect(formatDate('2024-01-15T10:30:00Z')).toBe('15 January 2024');
		expect(formatDate('2023-12-25T23:59:59.999Z')).toBe('25 December 2023');
	});

	it('should return invalid dates as-is', () => {
		expect(formatDate('invalid-date')).toBe('invalid-date');
		expect(formatDate('2024-13-01')).toBe('2024-13-01');
		expect(formatDate('')).toBe('');
	});

	it('should handle non-string inputs gracefully', () => {
		// @ts-expect-error - testing invalid input
		expect(formatDate(null)).toBe(null);
		// @ts-expect-error - testing invalid input
		expect(formatDate(undefined)).toBe(undefined);
	});
});
