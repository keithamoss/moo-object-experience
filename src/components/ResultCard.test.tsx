import { describe, expect, it, vi } from 'vitest';
import { createMockObjectData, createMockSearchResult, renderWithProviders, screen } from '../test-utils/test-helpers';
import ResultCard from './ResultCard';

describe('ResultCard', () => {
	it('should render object title', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:title': 'Stone Axe' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		expect(screen.getByText('Stone Axe')).toBeInTheDocument();
	});

	it('should render object identifier', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:identifier.moooi': 'OBJ-123' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		expect(screen.getByText('OBJ-123')).toBeInTheDocument();
	});

	it('should render object description', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:description': 'Ancient tool' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		expect(screen.getByText('Ancient tool')).toBeInTheDocument();
	});

	it('should render object creator', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:creator': 'Aboriginal peoples' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		expect(screen.getByText(/Aboriginal peoples/i)).toBeInTheDocument();
	});

	it('should render "Untitled" when title is missing', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:title': '' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		expect(screen.getByText('Untitled')).toBeInTheDocument();
	});

	it('should not render creator section when creator is empty', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:creator': '' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		expect(screen.queryByText(/Creator:/i)).not.toBeInTheDocument();
	});

	it('should highlight search terms when query provided', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:title': 'Stone Axe Head' });

		const { container } = renderWithProviders(<ResultCard result={result} object={object} query="stone" />);

		const marks = container.querySelectorAll('mark');
		expect(marks.length).toBeGreaterThan(0);
	});

	it('should render as a link when identifier is present', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData();

		renderWithProviders(<ResultCard result={result} object={object} />);

		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
	});

	it('should render as a card (non-link) when identifier is missing', () => {
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:identifier.moooi': '' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.getByTestId('result-card')).toBeInTheDocument();
	});

	it('should handle missing identifier gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const result = createMockSearchResult();
		const object = createMockObjectData({ 'dcterms:identifier.moooi': '' });

		renderWithProviders(<ResultCard result={result} object={object} />);

		// Should render without crashing - title is still present
		expect(screen.getByText('Test Object')).toBeInTheDocument();

		consoleSpy.mockRestore();
	});
});
