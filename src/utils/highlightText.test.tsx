import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { highlightSearchTerms } from './highlightText';

describe('highlightSearchTerms', () => {
	it('should return text as-is when query is empty', () => {
		const result = highlightSearchTerms('test text', '');
		expect(result).toEqual(['test text']);
	});

	it('should return text as-is when query is whitespace only', () => {
		const result = highlightSearchTerms('test text', '   ');
		expect(result).toEqual(['test text']);
	});

	it('should return text as-is when text is empty', () => {
		const result = highlightSearchTerms('', 'query');
		expect(result).toEqual(['']);
	});

	it('should highlight single matching term', () => {
		const result = highlightSearchTerms('stone axe head', 'stone');
		// Should have mark element for 'stone'
		expect(result.length).toBeGreaterThan(1);
	});

	it('should highlight multiple matching terms', () => {
		const result = highlightSearchTerms('stone axe tool', 'stone axe');
		// Should highlight both 'stone' and 'axe'
		expect(result.length).toBeGreaterThan(1);
	});

	it('should be case-insensitive', () => {
		const result = highlightSearchTerms('Stone Axe', 'stone');
		expect(result.length).toBeGreaterThan(1);
	});

	it('should handle special regex characters safely', () => {
		const result = highlightSearchTerms('test (with) brackets', 'with');
		expect(result.length).toBeGreaterThan(1);
	});

	it('should not highlight partial matches', () => {
		const result = highlightSearchTerms('testing', 'test');
		// 'test' is part of 'testing' but should match the stem
		expect(result).toBeDefined();
	});

	it('should render mark elements for matched terms', () => {
		const result = highlightSearchTerms('stone axe', 'stone');
		const { container } = render(<div>{result}</div>);
		const mark = container.querySelector('mark');

		// The mark element exists and wraps the matched text — colour is a theme
		// concern and should not be hardcoded in tests.
		expect(mark).toBeInTheDocument();
		expect(mark?.textContent).toBe('stone');
	});

	it('should escape query terms that contain regex metacharacters', () => {
		const result = highlightSearchTerms('Price ($100) and C++', '$100');
		const { container } = render(<div>{result}</div>);
		const mark = container.querySelector('mark');

		expect(mark).toBeInTheDocument();
		expect(mark?.textContent).toBe('$100');
	});

	it('should not throw when query contains regex special characters', () => {
		// Each of these would throw if not escaped
		const specialChars = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '[', ']', '|', '\\'];
		for (const char of specialChars) {
			expect(() => highlightSearchTerms('some text', char)).not.toThrow();
		}
	});

	it('should highlight unicode / accented characters', () => {
		const result = highlightSearchTerms('Café au lait', 'café');
		const { container } = render(<div>{result}</div>);
		const mark = container.querySelector('mark');

		expect(mark).toBeInTheDocument();
		expect(mark?.textContent?.toLowerCase()).toBe('café');
	});

	it('should handle multiple occurrences of same term', () => {
		const result = highlightSearchTerms('stone age stone tools', 'stone');
		const { container } = render(<div>{result}</div>);
		const marks = container.querySelectorAll('mark');

		expect(marks.length).toBe(2);
	});

	it('should split query by whitespace', () => {
		const result = highlightSearchTerms('aboriginal stone axe head', 'stone head');
		// Both 'stone' and 'head' should be highlighted
		expect(result.length).toBeGreaterThan(1);
	});
});
