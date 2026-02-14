import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../test-utils/test-helpers';
import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('should render breadcrumb items', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Objects', path: '/objects' },
      { label: 'Current Page' },
    ];

    renderWithProviders(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Objects')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('should render links for non-last items', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Current Page' },
    ];

    renderWithProviders(<Breadcrumbs items={items} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should not render link for last item (current page)', () => {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Current Page' },
    ];

    renderWithProviders(<Breadcrumbs items={items} />);

    const currentPage = screen.getByText('Current Page');
    const currentPageLink = currentPage.closest('a');
    expect(currentPageLink).not.toBeInTheDocument();
  });

  it('should have proper aria-label', () => {
    const items = [{ label: 'Home', path: '/' }];

    renderWithProviders(<Breadcrumbs items={items} />);

    expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument();
  });

  it('should render single breadcrumb item', () => {
    const items = [{ label: 'Current Page' }];

    renderWithProviders(<Breadcrumbs items={items} />);

    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('should render multiple breadcrumbs with correct links', () => {
    const items = [
      { label: 'Level 1', path: '/level1' },
      { label: 'Level 2', path: '/level1/level2' },
      { label: 'Level 3', path: '/level1/level2/level3' },
      { label: 'Current' },
    ];

    renderWithProviders(<Breadcrumbs items={items} />);

    expect(screen.getByText('Level 1').closest('a')).toHaveAttribute('href', '/level1');
    expect(screen.getByText('Level 2').closest('a')).toHaveAttribute('href', '/level1/level2');
    expect(screen.getByText('Level 3').closest('a')).toHaveAttribute('href', '/level1/level2/level3');
    expect(screen.getByText('Current').closest('a')).not.toBeInTheDocument();
  });
});
