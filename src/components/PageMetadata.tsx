/**
 * PageMetadata Component
 * A safe wrapper around React 19's native metadata elements that handles edge cases
 *
 * Addresses React 19 pitfalls:
 * 1. Ensures only ONE <title> is active at a time (critical during Suspense transitions)
 * 2. Provides a clean, type-safe API for setting page metadata
 * 3. Uses Context to coordinate between multiple route components
 *
 * Usage:
 *   // In App.tsx root:
 *   <PageMetadataProvider>
 *     <RouterProvider router={router} />
 *   </PageMetadataProvider>
 *
 *   // In route components:
 *   <PageMetadata
 *     title="My Page | App Name"
 *     description="Page description for SEO"
 *   />
 */

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react';

interface PageMetadataProps {
	/** Page title - will be rendered as document title */
	title: string;
	/** Meta description for SEO (optional) */
	description?: string;
}

interface MetadataState {
	title: string;
	description?: string;
	/** Tracks update order - higher = more recent */
	order: number;
}

interface MetadataContextValue {
	register: (id: string, title: string, description?: string) => void;
	unregister: (id: string) => void;
}

const MetadataContext = createContext<MetadataContextValue | null>(null);

// Add display name for React DevTools
MetadataContext.displayName = 'MetadataContext';

/**
 * Provider that coordinates metadata across route components
 * Implements "last-mounted-wins" strategy to handle Suspense transitions
 */
export function PageMetadataProvider({ children }: { children: ReactNode }) {
	const [registrations, setRegistrations] = useState<Map<string, MetadataState>>(new Map());
	// Monotonic counter to track update order (survives re-renders)
	const orderRef = useRef(0);

	const register = useCallback((id: string, title: string, description?: string) => {
		setRegistrations((prev) => {
			// Skip update if nothing changed (optimization)
			const existing = prev.get(id);
			if (existing && existing.title === title && existing.description === description) {
				return prev;
			}

			const next = new Map(prev);
			// Increment order to track this as the most recent update
			next.set(id, { title, description, order: ++orderRef.current });
			return next;
		});
	}, []);

	const unregister = useCallback((id: string) => {
		setRegistrations((prev) => {
			// Optimization: skip if not registered
			if (!prev.has(id)) return prev;

			const next = new Map(prev);
			next.delete(id);
			return next;
		});
	}, []);

	// Find the metadata entry with the highest order (most recently updated)
	const activeMetadata = useMemo(() => {
		if (registrations.size === 0) return null;

		// Find entry with maximum order value
		return Array.from(registrations.values()).reduce((latest, current) =>
			current.order > latest.order ? current : latest,
		);
	}, [registrations]);

	// Fallback: Sync to document.title for safety (in case React 19 hoisting fails)
	useEffect(() => {
		if (activeMetadata?.title) {
			document.title = activeMetadata.title;
		}
	}, [activeMetadata]);

	const contextValue = useMemo(() => ({ register, unregister }), [register, unregister]);

	return (
		<MetadataContext.Provider value={contextValue}>
			{children}
			{/* Only render ONE title element, coordinated by context */}
			{activeMetadata && (
				<>
					<title>{activeMetadata.title}</title>
					{activeMetadata.description && <meta name="description" content={activeMetadata.description} />}
				</>
			)}
		</MetadataContext.Provider>
	);
}

/**
 * Safe metadata component that registers with the provider
 * Only the most recently mounted component's metadata will be rendered
 */
export function PageMetadata({ title, description }: PageMetadataProps) {
	const context = useContext(MetadataContext);
	const id = useId();

	// Register this component's metadata (must be called unconditionally per React rules)
	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to register on every title/description change
	useEffect(() => {
		if (!context) return;
		context.register(id, title, description);
		return () => context.unregister(id);
	}, [title, description, id, context]);

	if (!context) {
		// CRITICAL: Without provider, rendering would create duplicate titles!
		// Only render in development to help developers find the issue
		if (import.meta.env.DEV) {
			console.error(
				'PageMetadata: Provider missing! This will cause duplicate title elements. ' +
					'Wrap your app with <PageMetadataProvider>.',
			);
		}

		// Fail safe: Don't render in production to avoid duplicate titles
		// Better to have no dynamic title than multiple title elements
		return null;
	}

	// Don't render anything - the provider handles rendering
	return null;
}

// Add display name for React DevTools
PageMetadata.displayName = 'PageMetadata';
PageMetadataProvider.displayName = 'PageMetadataProvider';
