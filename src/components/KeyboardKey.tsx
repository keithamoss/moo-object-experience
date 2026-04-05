/**
 * KeyboardKey component
 * Renders a keyboard key in a styled box for UI hints
 */

export interface KeyboardKeyProps {
	/** The keyboard key to display */
	readonly children: React.ReactNode;
}

/**
 * Styled keyboard key component for displaying keyboard shortcuts
 */
export default function KeyboardKey({ children }: KeyboardKeyProps) {
	return (
		<kbd
			style={{
				padding: '2px 6px',
				borderRadius: '3px',
				border: '1px solid var(--mantine-color-gray-4)',
				fontSize: '0.85em',
				fontFamily: 'monospace',
				display: 'inline-block',
			}}
		>
			{children}
		</kbd>
	);
}
