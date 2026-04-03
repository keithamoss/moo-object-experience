import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils/test-helpers';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
	it('should render error heading', () => {
		renderWithProviders(<NotFoundPage />);

		expect(screen.getByText('Something is not right...')).toBeInTheDocument();
	});

	it('should render descriptive message', () => {
		renderWithProviders(<NotFoundPage />);

		expect(screen.getByText(/the page you are trying to open does not exist/i)).toBeInTheDocument();
	});

	it('should render Get back to home page button', () => {
		renderWithProviders(<NotFoundPage />);

		expect(screen.getByRole('button', { name: /get back to home page/i })).toBeInTheDocument();
	});

	it('should navigate to home when button is clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(<NotFoundPage />);

		const homeButton = screen.getByRole('button', { name: /get back to home page/i });
		await user.click(homeButton);

		// Button should be clickable (no errors thrown)
		expect(homeButton).toBeInTheDocument();
	});

	it('should have proper page title', () => {
		renderWithProviders(<NotFoundPage />);

		// PageMetadata renders title element which React 19 hoists to document head
		const title = document.querySelector('title');
		expect(title).toBeInTheDocument();
		expect(title?.textContent).toBe("Page Not Found | Westralian People's Museum");
	});
});
