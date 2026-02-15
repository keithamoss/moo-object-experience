/**
 * PageMetadata Component Tests - Comprehensive Test Suite
 * Tests the Context-based wrapper for React 19 native metadata
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PageMetadata, PageMetadataProvider } from './PageMetadata';

describe('PageMetadata', () => {
	describe('Basic Rendering', () => {
		it('should render title element with provider', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="Test Title" />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title).toBeInTheDocument();
			expect(title?.textContent).toBe('Test Title');
		});

		it('should render title and description meta tag', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="Test Title" description="Test description for SEO" />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe('Test Title');

			const metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc).toBeInTheDocument();
			expect(metaDesc?.getAttribute('content')).toBe('Test description for SEO');
		});

		it('should not render description meta tag when description is omitted', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="Test Title" />
				</PageMetadataProvider>,
			);

			const metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc).not.toBeInTheDocument();
		});

		it('should render null when using provider (provider handles rendering)', () => {
			render(
				<PageMetadataProvider>
					<div data-testid="wrapper">
						<PageMetadata title="Test Title" />
					</div>
				</PageMetadataProvider>,
			);

			const wrapper = screen.getByTestId('wrapper');
			expect(wrapper.textContent).toBe('');
		});
	});

	describe('Fallback Mode (No Provider)', () => {
		it('should not render without provider (fail-safe)', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { container } = render(<PageMetadata title="Fallback Title" />);

			// Should not render anything (fail-safe behavior)
			const _title = document.querySelector('title');
			expect(container.textContent).toBe('');

			// Should log error if in development
			if (import.meta.env.DEV) {
				expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('PageMetadata: Provider missing'));
			}

			consoleError.mockRestore();
		});

		it('should not render description without provider', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { container } = render(<PageMetadata title="Fallback Title" description="Fallback description" />);

			// Should not render anything
			expect(container.textContent).toBe('');
			const metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc).toBeNull();

			consoleError.mockRestore();
		});

		it('should log error when provider is missing', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

			render(<PageMetadata title="Test" />);

			if (import.meta.env.DEV) {
				expect(consoleError).toHaveBeenCalledTimes(1);
				expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Provider missing'));
			}

			consoleError.mockRestore();
		});
	});

	describe('Last-Mounted-Wins Strategy', () => {
		it('should render metadata from the last mounted component', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="First Title" />
					<PageMetadata title="Second Title" />
					<PageMetadata title="Third Title" />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe('Third Title');
		});

		it('should update to newest component even with description', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="First" description="First desc" />
					<PageMetadata title="Second" description="Second desc" />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe('Second');

			const metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc?.getAttribute('content')).toBe('Second desc');
		});

		it('should handle mixed scenarios with and without descriptions', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="With Desc" description="Has description" />
					<PageMetadata title="Without Desc" />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe('Without Desc');

			const metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc).not.toBeInTheDocument();
		});
	});

	describe('Dynamic Updates', () => {
		it('should update title when prop changes', async () => {
			function TestComponent() {
				const [title, setTitle] = useState('Initial Title');

				useEffect(() => {
					const timer = setTimeout(() => setTitle('Updated Title'), 100);
					return () => clearTimeout(timer);
				}, []);

				return (
					<PageMetadataProvider>
						<PageMetadata title={title} />
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe('Initial Title');

			await waitFor(() => {
				expect(title?.textContent).toBe('Updated Title');
			});
		});

		it('should update description when prop changes', async () => {
			function TestComponent() {
				const [desc, setDesc] = useState('Initial description');

				useEffect(() => {
					const timer = setTimeout(() => setDesc('Updated description'), 100);
					return () => clearTimeout(timer);
				}, []);

				return (
					<PageMetadataProvider>
						<PageMetadata title="Static Title" description={desc} />
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			const metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc?.getAttribute('content')).toBe('Initial description');

			await waitFor(() => {
				expect(metaDesc?.getAttribute('content')).toBe('Updated description');
			});
		});

		it('should add description meta when initially undefined', async () => {
			function TestComponent() {
				const [desc, setDesc] = useState<string | undefined>(undefined);

				useEffect(() => {
					const timer = setTimeout(() => setDesc('New description'), 100);
					return () => clearTimeout(timer);
				}, []);

				return (
					<PageMetadataProvider>
						<PageMetadata title="Test" description={desc} />
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			let metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc).not.toBeInTheDocument();

			await waitFor(() => {
				metaDesc = document.querySelector('meta[name="description"]');
				expect(metaDesc).toBeInTheDocument();
				expect(metaDesc?.getAttribute('content')).toBe('New description');
			});
		});

		it('should remove description meta when set to undefined', async () => {
			function TestComponent() {
				const [desc, setDesc] = useState<string | undefined>('Initial description');

				useEffect(() => {
					const timer = setTimeout(() => setDesc(undefined), 100);
					return () => clearTimeout(timer);
				}, []);

				return (
					<PageMetadataProvider>
						<PageMetadata title="Test" description={desc} />
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			let metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc).toBeInTheDocument();

			await waitFor(() => {
				metaDesc = document.querySelector('meta[name="description"]');
				expect(metaDesc).not.toBeInTheDocument();
			});
		});
	});

	describe('Unmounting Behavior', () => {
		it('should remove metadata when component unmounts', () => {
			function TestComponent({ show }: { show: boolean }) {
				return (
					<PageMetadataProvider>
						{show && <PageMetadata title="Temporary Title" description="Temporary description" />}
					</PageMetadataProvider>
				);
			}

			const { rerender } = render(<TestComponent show={true} />);

			let title = document.querySelector('title');
			let metaDesc = document.querySelector('meta[name="description"]');
			expect(title?.textContent).toBe('Temporary Title');
			expect(metaDesc?.getAttribute('content')).toBe('Temporary description');

			rerender(<TestComponent show={false} />);

			title = document.querySelector('title');
			metaDesc = document.querySelector('meta[name="description"]');
			expect(title).not.toBeInTheDocument();
			expect(metaDesc).not.toBeInTheDocument();
		});

		it('should fall back to previous component when last one unmounts', () => {
			function TestComponent({ showSecond }: { showSecond: boolean }) {
				return (
					<PageMetadataProvider>
						<PageMetadata title="First Component" />
						{showSecond && <PageMetadata title="Second Component" />}
					</PageMetadataProvider>
				);
			}

			const { rerender } = render(<TestComponent showSecond={true} />);

			let title = document.querySelector('title');
			expect(title?.textContent).toBe('Second Component');

			rerender(<TestComponent showSecond={false} />);

			title = document.querySelector('title');
			expect(title?.textContent).toBe('First Component');
		});

		it('should handle multiple components mounting and unmounting', async () => {
			function TestComponent() {
				const [components, setComponents] = useState<string[]>(['A', 'B', 'C']);

				useEffect(() => {
					const timer = setTimeout(() => setComponents(['A', 'C']), 50);
					return () => clearTimeout(timer);
				}, []);

				return (
					<PageMetadataProvider>
						{components.map((name) => (
							<PageMetadata key={name} title={`Component ${name}`} />
						))}
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			let title = document.querySelector('title');
			expect(title?.textContent).toBe('Component C');

			await waitFor(() => {
				title = document.querySelector('title');
				expect(title?.textContent).toBe('Component C');
			});
		});
	});

	describe('Provider Stability', () => {
		it('should not cause infinite render loops', () => {
			let renderCount = 0;

			function ChildComponent() {
				renderCount++;
				return <PageMetadata title="Test" />;
			}

			function TestComponent() {
				return (
					<PageMetadataProvider>
						<ChildComponent />
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			const initialRenderCount = renderCount;
			expect(initialRenderCount).toBeGreaterThan(0);
			expect(initialRenderCount).toBeLessThan(10);
		});

		it('should handle rapid mount/unmount cycles without errors', async () => {
			function TestComponent() {
				const [show, setShow] = useState(true);

				useEffect(() => {
					const timers: ReturnType<typeof setTimeout>[] = [];
					for (let i = 0; i < 10; i++) {
						timers.push(
							setTimeout(() => {
								setShow((prev) => !prev);
							}, i * 20),
						);
					}
					return () => {
						for (const timer of timers) {
							clearTimeout(timer);
						}
					};
				}, []);

				return <PageMetadataProvider>{show && <PageMetadata title="Rapid Test" />}</PageMetadataProvider>;
			}

			expect(() => render(<TestComponent />)).not.toThrow();

			await waitFor(() => {}, { timeout: 250 });
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty string title', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="" />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe('');
		});

		it('should handle empty string description (does not render)', () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="Test" description="" />
				</PageMetadataProvider>,
			);

			const metaDesc = document.querySelector('meta[name="description"]');
			expect(metaDesc).not.toBeInTheDocument();
		});

		it('should handle special characters in title', () => {
			const specialTitle = 'Test <script>alert("xss")</script> & "quotes" | symbols';
			render(
				<PageMetadataProvider>
					<PageMetadata title={specialTitle} />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe(specialTitle);
		});

		it('should handle very long titles', () => {
			const longTitle = 'A'.repeat(1000);
			render(
				<PageMetadataProvider>
					<PageMetadata title={longTitle} />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe(longTitle);
		});

		it('should handle unicode characters', () => {
			const unicodeTitle = 'Museum Objects 🏛️ — Collection 中文 العربية';
			render(
				<PageMetadataProvider>
					<PageMetadata title={unicodeTitle} />
				</PageMetadataProvider>,
			);

			const title = document.querySelector('title');
			expect(title?.textContent).toBe(unicodeTitle);
		});

		it('should maintain single title element during transitions', async () => {
			function TestComponent() {
				const [show, setShow] = useState(false);

				useEffect(() => {
					const timer = setTimeout(() => setShow(true), 50);
					return () => clearTimeout(timer);
				}, []);

				return (
					<PageMetadataProvider>
						{!show && <PageMetadata title="Before" />}
						{show && <PageMetadata title="After" />}
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			const checkSingleTitle = () => {
				const titles = document.querySelectorAll('title');
				expect(titles.length).toBeLessThanOrEqual(1);
			};

			checkSingleTitle();

			await waitFor(() => {
				const title = document.querySelector('title');
				expect(title?.textContent).toBe('After');
				checkSingleTitle();
			});
		});
	});

	describe('Multiple Providers', () => {
		it('should allow multiple independent providers', () => {
			function Provider1() {
				return (
					<PageMetadataProvider>
						<PageMetadata title="Provider 1 Title" />
					</PageMetadataProvider>
				);
			}

			function Provider2() {
				return (
					<PageMetadataProvider>
						<PageMetadata title="Provider 2 Title" />
					</PageMetadataProvider>
				);
			}

			render(
				<div>
					<Provider1 />
					<Provider2 />
				</div>,
			);

			const titles = document.querySelectorAll('title');
			expect(titles.length).toBe(2);

			const titleTexts = Array.from(titles).map((t) => t.textContent);
			expect(titleTexts).toContain('Provider 1 Title');
			expect(titleTexts).toContain('Provider 2 Title');
		});
	});

	describe('Provider Children Rendering', () => {
		it('should render children components correctly', () => {
			render(
				<PageMetadataProvider>
					<div data-testid="child">Child Content</div>
					<PageMetadata title="Test" />
				</PageMetadataProvider>,
			);

			expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
		});

		it('should render multiple children with metadata scattered', () => {
			render(
				<PageMetadataProvider>
					<div data-testid="child1">First</div>
					<PageMetadata title="Test" />
					<div data-testid="child2">Second</div>
					<PageMetadata title="Test 2" />
					<div data-testid="child3">Third</div>
				</PageMetadataProvider>,
			);

			expect(screen.getByTestId('child1')).toBeInTheDocument();
			expect(screen.getByTestId('child2')).toBeInTheDocument();
			expect(screen.getByTestId('child3')).toBeInTheDocument();

			const title = document.querySelector('title');
			expect(title?.textContent).toBe('Test 2');
		});
	});

	describe('Bug Fixes - Last Updated Wins (Not Last Mounted)', () => {
		it('CRITICAL: earlier component update should become active (Map order bug)', async () => {
			// This test demonstrates the Map.set() order behavior bug
			// When component A mounts, then B mounts, then A updates -> B stays active (WRONG!)

			let component1RenderCount = 0;
			let component2RenderCount = 0;

			function Component1({ title }: { title: string }) {
				component1RenderCount++;
				return <PageMetadata title={title} />;
			}

			function Component2() {
				component2RenderCount++;
				return <PageMetadata title="Component 2 (Mounted Last)" />;
			}

			function TestComponent() {
				const [comp1Title, setComp1Title] = useState('Component 1 Initial');
				const [showComp2, setShowComp2] = useState(false);

				useEffect(() => {
					// Step 1: Component 1 mounts (renders once)
					// Step 2: After 50ms, Component 2 mounts -> becomes active (correct)
					const timer1 = setTimeout(() => setShowComp2(true), 50);
					// Step 3: After 100ms, Component 1 updates -> should become active (BUG: stays inactive)
					const timer2 = setTimeout(() => setComp1Title('Component 1 UPDATED'), 100);
					return () => {
						clearTimeout(timer1);
						clearTimeout(timer2);
					};
				}, []);

				return (
					<PageMetadataProvider>
						<Component1 title={comp1Title} />
						{showComp2 && <Component2 />}
					</PageMetadataProvider>
				);
			}

			const { rerender } = render(<TestComponent />);

			const titleElement = document.querySelector('title');

			// Initial state: Component 1 is active
			expect(titleElement?.textContent).toBe('Component 1 Initial');

			// After Component 2 mounts: Component 2 should be active
			await waitFor(() => {
				expect(titleElement?.textContent).toBe('Component 2 (Mounted Last)');
			});

			// After Component 1 updates: Component 1 should become active again!
			// This is the CRITICAL BUG: Map.set() doesn't change insertion order
			// So Component 2 stays at the end of the Map even though Component 1 was more recently updated
			await waitFor(
				() => {
					const currentTitle = titleElement?.textContent;
					console.log('Current title after Component 1 update:', currentTitle);
					console.log('Component 1 render count:', component1RenderCount);
					console.log('Component 2 render count:', component2RenderCount);

					// This SHOULD pass but likely WON'T with current implementation
					expect(currentTitle).toBe('Component 1 UPDATED');
				},
				{ timeout: 200 },
			);
		});

		it('should prioritize recently updated component over mount order', async () => {
			function TestComponent() {
				const [homeTitle, setHomeTitle] = useState('Home Page');
				const [showSearch, setShowSearch] = useState(false);

				useEffect(() => {
					// First show search page
					const timer1 = setTimeout(() => setShowSearch(true), 50);
					// Then update home page title - this should become active!
					const timer2 = setTimeout(() => setHomeTitle('Home Page Updated'), 100);
					return () => {
						clearTimeout(timer1);
						clearTimeout(timer2);
					};
				}, []);

				return (
					<PageMetadataProvider>
						<PageMetadata title={homeTitle} />
						{showSearch && <PageMetadata title="Search Page" />}
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			// Initially: Home Page
			const titleElement = document.querySelector('title');
			expect(titleElement?.textContent).toBe('Home Page');

			// After search mounts: Search Page
			await waitFor(() => {
				expect(titleElement?.textContent).toBe('Search Page');
			});

			// After home updates: Should show updated home title (CRITICAL BUG TEST)
			await waitFor(
				() => {
					expect(titleElement?.textContent).toBe('Home Page Updated');
				},
				{ timeout: 200 },
			);
		});

		it('should handle rapid updates from multiple components correctly', async () => {
			function TestComponent() {
				const [title1, setTitle1] = useState('Component 1');
				const [title2, setTitle2] = useState('Component 2');

				useEffect(() => {
					// Rapidly alternate updates
					const timer1 = setTimeout(() => setTitle1('Component 1 Updated'), 50);
					const timer2 = setTimeout(() => setTitle2('Component 2 Updated'), 60);
					const timer3 = setTimeout(() => setTitle1('Component 1 Final'), 70);
					return () => {
						clearTimeout(timer1);
						clearTimeout(timer2);
						clearTimeout(timer3);
					};
				}, []);

				return (
					<PageMetadataProvider>
						<PageMetadata title={title1} />
						<PageMetadata title={title2} />
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			const titleElement = document.querySelector('title');

			// Should end with the last update (Component 1 Final)
			await waitFor(
				() => {
					expect(titleElement?.textContent).toBe('Component 1 Final');
				},
				{ timeout: 150 },
			);
		});
	});

	describe('Bug Fixes - Fallback Mode Safety', () => {
		it('should prevent duplicate title elements by not rendering without provider', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

			render(
				<div>
					<PageMetadata title="Title 1" />
					<PageMetadata title="Title 2" />
				</div>,
			);

			// After fix: Should not create ANY title elements without provider (fail-safe)
			const titles = document.querySelectorAll('title');
			expect(titles.length).toBe(0);

			// Should log error in development mode
			if (import.meta.env.DEV) {
				expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('PageMetadata: Provider missing'));
			}

			consoleError.mockRestore();
		});

		it('should not render in fallback mode (production safety)', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { container } = render(<PageMetadata title="Test Title" />);

			// Should render nothing (null)
			expect(container.textContent).toBe('');

			consoleError.mockRestore();
		});
	});

	describe('Bug Fixes - Document.title Synchronization', () => {
		it('should synchronize title to document.title as fallback', async () => {
			render(
				<PageMetadataProvider>
					<PageMetadata title="Test Document Title" />
				</PageMetadataProvider>,
			);

			await waitFor(() => {
				expect(document.title).toBe('Test Document Title');
			});
		});

		it('should update document.title when metadata changes', async () => {
			function TestComponent() {
				const [title, setTitle] = useState('Initial');

				useEffect(() => {
					const timer = setTimeout(() => setTitle('Updated'), 50);
					return () => clearTimeout(timer);
				}, []);

				return (
					<PageMetadataProvider>
						<PageMetadata title={title} />
					</PageMetadataProvider>
				);
			}

			render(<TestComponent />);

			expect(document.title).toBe('Initial');

			await waitFor(() => {
				expect(document.title).toBe('Updated');
			});
		});
	});
});
