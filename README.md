# Museum Object Experience

A simple frontend search and discovery UI for a personal museum collection backed by Google Sheets.

## Project Overview

This is a client-side web application that provides search and browse capabilities for a museum object collection stored in Google Sheets. The interface is minimal, mobile-first, and designed for MVP functionality with high code quality.

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **Search**: MiniSearch library (client-side full-text search with fuzzy matching)
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **Data Source**: Google Sheets API v4 (read-only, no backend)
- **Hosting**: GitHub Pages with custom domain
- **CI/CD**: GitHub Actions (automated deployment on push to main)

## Project Structure

```
moo-object-experience/
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-based modules (search, objects)
│   ├── store/          # Redux store and slices
│   ├── theme/          # MUI theme customization
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite environment types
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── .eslintrc.cjs       # ESLint configuration
```

## Getting Started

### Prerequisites

- **Node.js**: 20+ and npm 10+
- **Google Cloud Project**: With Sheets API v4 enabled
- **Google Sheets API key**: Restricted to your domain
- **Google Sheet**: With required structure (see below)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/keithamoss/moo-object-experience.git
   cd moo-object-experience
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Google Sheets API** (one-time setup):
   
   See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for detailed instructions on:
   - Creating a Google Cloud Project
   - Enabling Google Sheets API v4
   - Creating and restricting an API key
   - Preparing your Google Sheet
   
   Once you have your API key and Sheet ID, add them to `src/config/sheets.ts`:
   ```typescript
   export const SHEETS_CONFIG = {
     apiKey: 'YOUR_ACTUAL_API_KEY',
     sheetId: 'YOUR_ACTUAL_SHEET_ID',
     // ... other config
   };
   ```
   
   **Important**: The API key and Sheet ID are intentionally public (visible in browser network requests). Security is provided by HTTP referrer restrictions on the API key.

### Development

**Run development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173` with hot-module reloading.

**Run tests:**
```bash
npm test                  # Run unit tests once
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
npm run test:report       # View test report in browser
```

**Run end-to-end tests:**
```bash
npm run test:e2e          # Run Playwright tests headlessly
npm run test:e2e:ui       # Open Playwright UI
npm run test:e2e:headed   # Run with browser visible
npm run test:e2e:report   # View test report
```

**Linting:**
```bash
npm run lint              # Check TypeScript and ESLint issues
npm run lint:fix          # Auto-fix ESLint issues
```

### Building for Production

**Build the app:**
```bash
npm run build
```

This compiles TypeScript and bundles with Vite to `dist/`.

**Preview production build locally:**
```bash
npm run preview
```

## Google Sheets Structure

Your Google Sheet must contain exactly two worksheets with specific structures:

### Worksheet 1: Mappings (Metadata Schema)

The Mappings worksheet defines the structure, types, and properties of all data fields. Each row represents one field definition.

**Required Columns:**

| Column Name | Purpose | Example Values |
|------------|---------|----------------|
| `Field` | The field identifier (used as column header in Objects sheet) | `dcterms:identifier.moooi`, `dcterms:title`, `moo:material` |
| `Namespace` | The metadata standard namespace | `dcterms`, `moo`, `dwc` |
| `Label` | Human-readable field name (displayed in UI) | "Identifier", "Title", "Material" |
| `Applicable collections` | Which collections use this field | "All", "Core, Library", "Ephemera" |
| `Required` | Whether field is mandatory for completeness | "Mandatory", "Optional", "" |
| `Purpose` | Description of what this field represents | "A unique identifier for the object" |
| `Field type and controls` | Data type and input constraints | "Free text", "Controlled - Dropdown", "Image", "ISO8601 date" |
| `Example` | Sample value (for documentation only) | "MOO-2024-001", "Stone axe head" |

**Important Notes:**

- The first row must be the header row with these column names
- Column names are case-insensitive and matched flexibly (e.g., "field type" matches "Field type and controls")
- Only the `Field` column is strictly required; other columns can be empty but must exist
- Fields are displayed in the order they appear in this sheet
- Example column is for developer reference only and not used by the application

**Field Types:**

The `Field type and controls` column determines how fields are displayed:

- `Free text` - Plain text display with line breaks preserved
- `Controlled - Dropdown` - Plain text (dropdown is editor-side only)
- `Image` - Displays as an image with lazy loading (field value should be a URL)
- `ISO8601 date` - Formatted as human-readable dates (supports YYYY, YYYY-MM, YYYY-MM-DD)
- `URL` - Rendered as clickable links
- `Comma-separated list` - Rendered as Material-UI chips

**Example Metadata Rows:**

```
Field                          | Namespace | Label       | Applicable collections | Required  | Purpose                           | Field type and controls | Example
------------------------------|-----------|-------------|------------------------|-----------|-----------------------------------|-------------------------|------------------
dcterms:identifier.moooi      | dcterms   | Identifier  | All                    | Mandatory | Unique object identifier          | Free text               | MOO-2024-001
dcterms:title                 | dcterms   | Title       | All                    | Mandatory | Name of the object                | Free text               | Stone axe head
dcterms:description           | dcterms   | Description | All                    | Mandatory | Detailed description              | Free text               | Aboriginal stone...
moo:images.hero               | moo       | Hero Image  | All                    | Optional  | Primary display image             | Image                   | https://...
dcterms:created               | dcterms   | Date Created| Core                   | Optional  | When the object was created       | ISO8601 date            | 1950
moo:material                  | moo       | Materials   | Core, Library          | Optional  | Materials used in construction    | Comma-separated list    | Stone, wood
```

### Worksheet 2: Museum (Objects Data)

The Museum worksheet contains all object records. Each row represents one object.

**Structure:**

- **First row**: Header row with field names (must match `Field` values from Mappings sheet)
- **Subsequent rows**: Object data, with one object per row

**Required Fields:**

The following fields MUST exist as columns and MUST have values for each object:

- `dcterms:identifier.moooi` - Unique identifier for the object (e.g., "MOO-2024-001")
- `dcterms:title` - Object name/title
- `dcterms:description` - Full description

**Optional Fields:**

All other fields defined in the Mappings sheet can be included as columns. Empty cells are displayed as empty in the UI.

**Searchable Fields:**

The following fields are searched (hardcoded with weights):

- `dcterms:title` (weight: 3) - Highest priority
- `dcterms:alternative` (weight: 2) - Alternative titles
- `dcterms:creator` (weight: 2) - Creator/maker names  
- `dcterms:description` (weight: 1) - Full text description

**Example Object Rows:**

| dcterms:identifier.moooi | dcterms:title | dcterms:description | moo:images.hero | dcterms:created | moo:material |
|-------------------------|---------------|---------------------|-----------------|-----------------|--------------|
| MOO-2024-001 | Stone axe head | Aboriginal stone axe head from Western Australia... | https://example.com/axe.jpg | 1850 | Stone, wood |
| MOO-2024-002 | Ceramic vase | Blue and white ceramic vase with floral patterns... | https://example.com/vase.jpg | 1920-05 | Ceramic |

**Important Notes:**

- Column order doesn't matter (the app uses column headers to map data)
- Empty cells are handled gracefully (displayed as empty in UI)
- Rows without an identifier are skipped with a console warning
- Column headers must exactly match field names in Mappings sheet
- Image URLs should be publicly accessible (no authentication required)
- Dates can be partial: YYYY, YYYY-MM, or YYYY-MM-DD

### Setting Up Your Sheet

1. **Create the Mappings worksheet:**
   - Add tab named exactly "Mappings"
   - Add the 8 required column headers
   - Add one row per field you want to define
   - Set field types appropriately

2. **Create the Museum worksheet:**
   - Add tab named exactly "Museum"
   - Use field names from Mappings sheet as column headers
   - Add one row per object
   - Ensure required fields have values

3. **Set sheet permissions:**
   - Share → Anyone with the link can **View**
   - Do not allow editing access

4. **Test the structure:**
   - Load the app in development mode
   - Check browser console for any parsing errors
   - Verify all fields display correctly on detail pages

### Troubleshooting

**"Missing required columns" error:**
- Verify Mappings sheet has all 8 column headers
- Check for typos in column names
- Ensure first row is the header row

**Objects not appearing:**
- Check that Museum sheet has dcterms:identifier.moooi column
- Verify each object row has a non-empty identifier value
- Check browser console for specific object validation errors

**Fields not displaying:**
- Verify column header in Museum matches Field name in Mappings exactly
- Check that Field Type is spelled correctly (affects rendering)
- Ensure worksheet names are exactly "Mappings" and "Museum" (case-sensitive)

## Features

### Implemented ✅

- **Project Foundation**: React + TypeScript + Vite with modern tooling
- **Material-UI Theme**: Accessible color palette (WCAG 2.1 Level AA compliant)
- **Redux Toolkit + RTK Query**: Automatic caching, entity normalization, O(1) lookups
- **React Router v7**: Client-side routing with URL-based state management
- **Google Sheets API Integration**: Dynamic schema-driven data fetching
- **Full-Text Search**: MiniSearch with fuzzy matching and field-specific weights
- **Search UI**: 
  - Real-time search with highlighted matches
  - Customizable field filters (title, alternative title, creator, description)
  - Keyboard shortcuts (Enter to search, Esc to clear)
  - Filter badges and result counts
- **Object Detail Pages**: 
  - SEO-friendly URLs with slugs (`/object/:id/:slug`)
  - Dynamic field rendering based on metadata types
  - Image display with lazy loading and error handling
  - Breadcrumb navigation
  - Rich field formatting (dates, URLs, lists, images)
- **Error Handling**: ErrorBoundary component with graceful fallbacks  
- **Mobile-First Responsive Design**: Optimized for 320px+ screens
- **URL State Management**: All search state in URL for shareable links
- **GitHub Pages Deployment**: Automated CI/CD on push to main
- **Testing Infrastructure**: 
  - Unit tests with Vitest + React Testing Library
  - E2E tests with Playwright
  - Test coverage reporting
- **TypeScript Strict Mode**: Type-safe codebase with comprehensive interfaces
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

### Planned Features 🔮

- Advanced search (date ranges, Boolean operators)
- Collections/grouping view
- Timeline view for date-based browsing
- Map view (if location data available)
- Export functionality (PDF, citations)
- Analytics integration (Plausible/Google Analytics)
- Service Worker for offline support

## Deployment

The site automatically deploys to GitHub Pages on every push to the `main` branch via GitHub Actions.

### Live URLs

- **Production**: https://moo.keithandhelenmakestuff.com
- **GitHub Pages**: https://keithamoss.github.io/moo-object-experience/

### First-Time Setup

For initial deployment configuration, see [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for detailed instructions on:

1. **GitHub Pages Configuration**:
   - Enabling GitHub Actions as deployment source
   - Configuring custom domain
   - Adding repository secrets for API credentials

2. **DNS Configuration** (via Cloudflare):
   - Creating CNAME record pointing to GitHub Pages
   - Configuring proxy settings
   - SSL/HTTPS setup

3. **Deployment Workflow**:
   - Automatic builds on push to main
   - Asset optimization and bundling
   - Deployment verification

### Deployment Process

The deployment workflow (`.github/workflows/deploy.yml`) automatically:

1. **Installs dependencies** and runs type checking
2. **Runs test suite** (unit + E2E tests) - deployment fails if tests fail
3. **Builds production bundle** with Vite
4. **Deploys to GitHub Pages** using official GitHub Pages action
5. **Completes in 1-2 minutes** from push to live

**Monitor deployment status**: Check the **Actions** tab in the GitHub repository.

### Environment Configuration

**For local development**: Edit `src/config/sheets.ts` directly.

**For production**: The same configuration file is used. The API key is public but secured via HTTP referrer restrictions that only allow requests from authorized domains.

**GitHub Secrets** (optional): You can optionally configure secrets in GitHub repository settings for additional security layers, though the current implementation uses public API keys with referrer restrictions.

## Development Principles

1. **URL State**: All application state stored in URL parameters for shareable links and seamless browser history navigation
2. **MVP Focus**: Lean, iterative implementation with room for evolution
3. **Mobile First**: Responsive design optimized for mobile screens (320px+) first
4. **No Caching**: Fresh data fetched on each visit (performance acceptable with loading indicators)
5. **Minimal Dependencies**: Lean dependency tree with purposeful library choices
6. **Type Safety**: TypeScript strict mode with comprehensive type definitions
7. **Testing**: Comprehensive unit and E2E test coverage for reliability
8. **Accessibility**: WCAG 2.1 Level AA compliance throughout

## Architecture Highlights

### State Management

**RTK Query** for data fetching with automatic:
- Caching and invalidation
- Loading and error states
- Entity normalization for O(1) lookups
- Memoized selectors

**Redux Toolkit** slices for:
- Search query and results
- Active filter state
- UI state management

### Search Implementation

**MiniSearch** client-side search engine:
- Full-text indexing of 4 configurable fields
- Fuzzy matching with configurable tolerance
- Prefix matching for partial words
- Field-specific search weights (title: 3, alternative: 2, creator: 2, description: 1)
- Real-time search with highlighted results

### Dynamic Schema

**Metadata-driven rendering**:
- Field definitions fetched from Google Sheets "Mappings" worksheet
- Dynamic field types (text, date, URL, image, list)
- Flexible display order configurable via spreadsheet
- No hardcoded field definitions in code

### Data Flow

```
Google Sheets → RTK Query → Normalized Redux Store → Memoized Selectors → React Components
                     ↓
                MiniSearch Index → Search Results
```

### URL State Pattern

All state serialized to URL query parameters:
- `?q=search+term` - Search query
- `?fields=title,creator` - Active search fields
- Browser back/forward work seamlessly
- Direct navigation to any state via URL
- Shareable links preserve application state

### Component Architecture

- **Feature-based structure**: `features/home`, `features/objects`
- **Reusable components**: `components/` for shared UI
- **Type-safe utilities**: `utils/` for pure functions
- **ErrorBoundary**: Graceful error handling at component level
- **Custom hooks**: `useData`, `useSearchIndex`, `useSelectors` for business logic

## Timeline

This is a 2-week MVP project with potential for future enhancements.

## Reference

Based on architecture patterns from [demsausage](https://github.com/keithamoss/demsausage) public-redesign implementation.

## License

[Your License Here]
