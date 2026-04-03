/**
 * Error Boundary component for catching and displaying React errors
 * Essential for use with Suspense and async components
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <Suspense fallback={<LoadingIndicator />}>
 *     <YourComponent />
 *   </Suspense>
 * </ErrorBoundary>
 * ```
 *
 * Or with custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

import { Button, Center, Group, Paper, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error to console in development
		if (import.meta.env.DEV) {
			console.error('Error caught by ErrorBoundary:', error, errorInfo);
		}
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<Center style={{ minHeight: '50vh', padding: 'var(--mantine-spacing-xl)' }}>
					<Paper withBorder p="xl" radius="md" style={{ maxWidth: 600, textAlign: 'center' }}>
						<IconAlertCircle
							size={64}
							color="var(--mantine-color-red-6)"
							style={{ marginBottom: 'var(--mantine-spacing-md)' }}
						/>
						<Title order={2} mb="sm">
							Something went wrong
						</Title>
						<Text c="dimmed" mb="lg">
							{this.state.error?.message || 'An unexpected error occurred'}
						</Text>
						<Group justify="center">
							<Button variant="filled" onClick={this.handleReset}>
								Try Again
							</Button>
							<Button variant="outline" onClick={() => (window.location.href = '/')}>
								Go Home
							</Button>
						</Group>
					</Paper>
				</Center>
			);
		}

		return this.props.children;
	}
}
