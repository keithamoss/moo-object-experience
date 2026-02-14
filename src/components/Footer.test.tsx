import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
	it('should render footer with current year', () => {
		const currentYear = new Date().getFullYear();
		render(<Footer />);

		expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
	});

	it('should render organization name', () => {
		render(<Footer />);

		expect(screen.getByText(/Westralian People's Museum/i)).toBeInTheDocument();
	});

	it('should render contact link', () => {
		render(<Footer />);

		const contactLink = screen.getByText('Contact');
		expect(contactLink).toBeInTheDocument();
		expect(contactLink).toHaveAttribute('href', 'mailto:contact@example.com');
	});

	it('should render as footer element', () => {
		const { container } = render(<Footer />);

		const footer = container.querySelector('footer');
		expect(footer).toBeInTheDocument();
	});
});
