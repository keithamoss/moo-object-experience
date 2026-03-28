import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OBJECT_FIELDS } from '../../constants/objectFields';
import type { SearchResult } from '../../services/search';
import { createMockObjectData, createMockSearchResult, renderWithProviders } from '../../test-utils/test-helpers';
import type { ObjectData } from '../../types/metadata';
import SearchResults from './SearchResults';

function makeObject(overrides: Partial<ObjectData> = {}): ObjectData {
	return createMockObjectData(overrides) as ObjectData;
}

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
	return createMockSearchResult(overrides) as SearchResult;
}

describe('SearchResults', () => {
	it('should render result count heading', () => {
		const objects = [makeObject()];
		const results = [makeResult({ id: 'TEST-001' })];

		renderWithProviders(
			<SearchResults results={results} objects={objects} query="test" />,
		);

		expect(screen.getByText(/1 result for/i)).toBeInTheDocument();
	});

	it('should pluralise "results" for more than one result', () => {
		const objects = [
			makeObject({ [OBJECT_FIELDS.IDENTIFIER]: 'A', [OBJECT_FIELDS.TITLE]: 'Alpha' }),
			makeObject({ [OBJECT_FIELDS.IDENTIFIER]: 'B', [OBJECT_FIELDS.TITLE]: 'Beta' }),
		];

		const results = [
			makeResult({ id: 'A', score: 2 }),
			makeResult({ id: 'B', score: 1 }),
		];

		renderWithProviders(
			<SearchResults results={results} objects={objects} query="test" />,
		);

		expect(screen.getByText(/2 results for/i)).toBeInTheDocument();
	});

	it('should render an info alert when there are no results but a query exists', () => {
		renderWithProviders(
			<SearchResults results={[]} objects={[]} query="nonexistent" />,
		);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/no results found for/i)).toBeInTheDocument();
	});

	it('should render nothing when query is empty', () => {
		const { container } = renderWithProviders(
			<SearchResults results={[]} objects={[]} query="" />,
		);

		expect(container.firstChild).toBeNull();
	});

	it('should render nothing when query is only whitespace', () => {
		const { container } = renderWithProviders(
			<SearchResults results={[]} objects={[]} query="   " />,
		);

		expect(container.firstChild).toBeNull();
	});

	it('should show a loading spinner when isSearching is true', () => {
		const objects = [makeObject()];
		const results = [makeResult({ id: 'TEST-001' })];

		renderWithProviders(
			<SearchResults results={results} objects={objects} query="test" isSearching />,
		);

		expect(screen.getByRole('progressbar')).toBeInTheDocument();
	});

	it('should not show a spinner when isSearching is false (default)', () => {
		const objects = [makeObject()];
		const results = [makeResult({ id: 'TEST-001' })];

		renderWithProviders(
			<SearchResults results={results} objects={objects} query="test" isSearching={false} />,
		);

		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
	});

	it('should skip results whose object ID is not in the objects array', () => {
		const objects = [makeObject({ [OBJECT_FIELDS.IDENTIFIER]: 'KNOWN' })];
		const results = [
			makeResult({ id: 'KNOWN', score: 2 }),
			makeResult({ id: 'UNKNOWN', score: 1 }), // No corresponding object
		];

		renderWithProviders(
			<SearchResults results={results} objects={objects} query="test" />,
		);

		// Only 1 result should be rendered (UNKNOWN is silently dropped)
		expect(screen.getByText(/2 results for/i)).toBeInTheDocument();
		expect(screen.getAllByTestId('result-card')).toHaveLength(1);
	});

	it('should quote the search query in the results heading', () => {
		const objects = [makeObject()];
		const results = [makeResult({ id: 'TEST-001' })];

		renderWithProviders(
			<SearchResults results={results} objects={objects} query="stone axe" />,
		);

		expect(screen.getByText(/"stone axe"/i)).toBeInTheDocument();
	});
});
