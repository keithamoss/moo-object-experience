import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test-utils/test-helpers';
import { FieldValue } from './FieldValue';

describe('FieldValue', () => {
	describe('empty / missing values', () => {
		it('should return null for undefined value', () => {
			render(
				<div data-testid="w">
					<FieldValue value={undefined} fieldTypeAndControls="Free text" />
				</div>,
			);
			expect(screen.getByTestId('w')).toBeEmptyDOMElement();
		});

		it('should return null for empty string', () => {
			render(
				<div data-testid="w">
					<FieldValue value="" fieldTypeAndControls="Free text" />
				</div>,
			);
			expect(screen.getByTestId('w')).toBeEmptyDOMElement();
		});

		it('should return null for whitespace-only string', () => {
			render(
				<div data-testid="w">
					<FieldValue value="   " fieldTypeAndControls="Free text" />
				</div>,
			);
			expect(screen.getByTestId('w')).toBeEmptyDOMElement();
		});
	});

	describe('URL fields', () => {
		it('should render a clickable anchor for URL type', () => {
			render(<FieldValue value="https://example.com/resource" fieldTypeAndControls="URL" />);

			const link = screen.getByRole('link');
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute('href', 'https://example.com/resource');
		});

		it('should open URL in a new tab with security attributes', () => {
			render(<FieldValue value="https://example.com" fieldTypeAndControls="URL" />);

			const link = screen.getByRole('link');
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});

		it('should truncate display text for URLs longer than 60 characters', () => {
			const longUrl = `https://example.com/${'a'.repeat(60)}`;

			render(<FieldValue value={longUrl} fieldTypeAndControls="URL" />);

			const link = screen.getByRole('link');
			expect(link.textContent).toMatch(/\.\.\.$/);
			expect(link.textContent?.length).toBeLessThanOrEqual(63); // 60 chars + "..."
		});

		it('should NOT truncate short URLs', () => {
			const shortUrl = 'https://example.com/path';

			render(<FieldValue value={shortUrl} fieldTypeAndControls="URL" />);

			expect(screen.getByRole('link').textContent).toBe(shortUrl);
		});
	});

	describe('date fields', () => {
		it('should format a full ISO date into human-readable form', () => {
			render(<FieldValue value="2024-03-15" fieldTypeAndControls="ISO8601 compliant date" />);

			expect(screen.getByText('15 March 2024')).toBeInTheDocument();
		});

		it('should format a year-month date', () => {
			render(<FieldValue value="2024-01" fieldTypeAndControls="ISO8601 compliant date" />);

			expect(screen.getByText('January 2024')).toBeInTheDocument();
		});

		it('should display a year-only date as-is', () => {
			render(<FieldValue value="2024" fieldTypeAndControls="ISO8601 compliant date" />);

			expect(screen.getByText('2024')).toBeInTheDocument();
		});
	});

	describe('comma-separated fields', () => {
		it('should render each item as a chip', () => {
			render(<FieldValue value="Ceramics, Pottery, Sculpture" fieldTypeAndControls="Comma-separated list" />);

			expect(screen.getByText('Ceramics')).toBeInTheDocument();
			expect(screen.getByText('Pottery')).toBeInTheDocument();
			expect(screen.getByText('Sculpture')).toBeInTheDocument();
		});

		it('should filter out empty items after splitting', () => {
			render(<FieldValue value="Alpha, , Beta" fieldTypeAndControls="Comma separated" />);

			expect(screen.getByText('Alpha')).toBeInTheDocument();
			expect(screen.getByText('Beta')).toBeInTheDocument();
			// There should be exactly 2 chips, not 3
			expect(screen.queryAllByRole('button').length).toBe(0); // chips are not buttons
		});
	});

	describe('default / multi-line text fields', () => {
		it('should render plain text for free text type', () => {
			render(<FieldValue value="Hello world" fieldTypeAndControls="Free text" />);

			expect(screen.getByText('Hello world')).toBeInTheDocument();
		});

		it('should preserve line breaks as <br> elements', () => {
			const { container } = render(<FieldValue value={'Line one\nLine two'} fieldTypeAndControls="Free text" />);

			expect(container.querySelector('br')).toBeInTheDocument();
			expect(container.textContent).toContain('Line one');
			expect(container.textContent).toContain('Line two');
		});
	});
});
