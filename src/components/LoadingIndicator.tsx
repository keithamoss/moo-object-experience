import { Loader, Stack, Text } from '@mantine/core';

interface LoadingIndicatorProps {
	readonly message?: string;
}

export default function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
	return (
		<Stack
			data-testid="loading-indicator"
			role="status"
			aria-live="polite"
			aria-label={message}
			align="center"
			justify="center"
			style={{ minHeight: '200px' }}
		>
			<Loader data-testid="loader" aria-label="Loading" />
			<Text size="sm" c="dimmed" aria-hidden="true">
				{message}
			</Text>
		</Stack>
	);
}
