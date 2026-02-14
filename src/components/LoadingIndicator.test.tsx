import { describe, expect, it } from 'vitest';
import { render, screen } from '../test-utils/test-helpers';
import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator', () => {
  it('should render loading spinner with default message', () => {
    render(<LoadingIndicator />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingIndicator message="Fetching data..." />);

    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingIndicator message="Please wait" />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'Please wait');
  });

  it('should render CircularProgress component', () => {
    const { container } = render(<LoadingIndicator />);

    // MUI CircularProgress renders with specific class
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });
});
