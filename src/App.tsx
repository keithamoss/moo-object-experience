import { Box, Transition } from '@mantine/core';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import LoadingIndicator from './components/LoadingIndicator';
import { ErrorBoundary } from './store';

const headerTransition = {
	in: { opacity: 1, transform: 'translateY(0)', maxHeight: '56px' },
	out: { opacity: 0, transform: 'translateY(-100%)', maxHeight: '0' },
	common: { overflow: 'hidden', transformOrigin: 'top center' },
	transitionProperty: 'opacity, transform, max-height',
};

function App(): React.ReactElement {
	const location = useLocation();
	const isHomepage = location.pathname === '/';

	return (
		<Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<Transition mounted={!isHomepage} transition={headerTransition} duration={280} timingFunction="ease">
				{(styles) => (
					<div style={styles}>
						<Header />
					</div>
				)}
			</Transition>
			<Box component="main" style={{ flex: 1 }}>
				<ErrorBoundary>
					<Suspense fallback={<LoadingIndicator message="Loading..." />}>
						<Outlet />
					</Suspense>
				</ErrorBoundary>
			</Box>
			<Footer />
		</Box>
	);
}

export default App;
