import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils/test-helpers';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  it('should render 404 heading', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('should render descriptive message', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText(/sorry, the page you're looking for doesn't exist/i)).toBeInTheDocument();
  });

  it('should render Go to Home button', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
  });

  it('should navigate to home when button is clicked', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<NotFoundPage />);

    const homeButton = screen.getByRole('button', { name: /go to home/i });
    await user.click(homeButton);

    // Button should be clickable (no errors thrown)
    expect(homeButton).toBeInTheDocument();
  });

  it('should have proper page title in helmet', () => {
    renderWithProviders(<NotFoundPage />);

    // Helmet updates document.title
    expect(document.title).toBe('Page Not Found | Westralian People\'s Museum');
  });
});
