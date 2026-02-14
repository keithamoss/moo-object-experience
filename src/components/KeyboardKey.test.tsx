import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import KeyboardKey from './KeyboardKey';

describe('KeyboardKey', () => {
	it('should render the key text', () => {
		render(<KeyboardKey>Ctrl</KeyboardKey>);
		expect(screen.getByText('Ctrl')).toBeInTheDocument();
	});

	it('should render as a kbd element', () => {
		const { container } = render(<KeyboardKey>Enter</KeyboardKey>);
		const kbd = container.querySelector('kbd');
		expect(kbd).toBeInTheDocument();
		expect(kbd).toHaveTextContent('Enter');
	});

	it('should render multiple keys', () => {
		const { container } = render(
			<>
				<KeyboardKey>Ctrl</KeyboardKey>
				<KeyboardKey>K</KeyboardKey>
			</>,
		);
		expect(screen.getByText('Ctrl')).toBeInTheDocument();
		expect(screen.getByText('K')).toBeInTheDocument();
		expect(container.querySelectorAll('kbd')).toHaveLength(2);
	});

	it('should handle special characters', () => {
		render(<KeyboardKey>⌘</KeyboardKey>);
		expect(screen.getByText('⌘')).toBeInTheDocument();
	});
});
