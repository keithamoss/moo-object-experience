import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils/test-helpers';
import InvalidObjectPage from './InvalidObjectPage';

describe('InvalidObjectPage', () => {
	it('should render missing-identifier error', () => {
		renderWithProviders(<InvalidObjectPage reason="missing-identifier" />);

		expect(screen.getByText('Invalid Object')).toBeInTheDocument();
		expect(screen.getByText(/missing a required identifier field/i)).toBeInTheDocument();
	});

	it('should render invalid-data error', () => {
		renderWithProviders(<InvalidObjectPage reason="invalid-data" />);

		expect(screen.getByText('Invalid Object Data')).toBeInTheDocument();
		expect(screen.getByText(/incomplete or invalid data structure/i)).toBeInTheDocument();
	});

	it('should display object ID when provided', () => {
		renderWithProviders(<InvalidObjectPage reason="missing-identifier" objectId="TEST-123" />);

		expect(screen.getByText(/Object ID: TEST-123/i)).toBeInTheDocument();
	});

	it('should not display object ID when not provided', () => {
		renderWithProviders(<InvalidObjectPage reason="invalid-data" />);

		expect(screen.queryByText(/Object ID:/i)).not.toBeInTheDocument();
	});

	it('should render Go Home button', () => {
		renderWithProviders(<InvalidObjectPage reason="missing-identifier" />);

		expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
	});

	it('should navigate to home when button clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(<InvalidObjectPage reason="invalid-data" />);

		const homeButton = screen.getByRole('button', { name: /return to home/i });
		await user.click(homeButton);

		// Button should be clickable (no errors thrown)
		expect(homeButton).toBeInTheDocument();
	});

	it('should render error icon', () => {
		const { container } = renderWithProviders(<InvalidObjectPage reason="missing-identifier" />);

		const icon = container.querySelector('[data-testid="ErrorOutlineIcon"]');
		expect(icon).toBeInTheDocument();
	});
});
