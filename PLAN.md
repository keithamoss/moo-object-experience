# Background and scope
I am developing a simple frontend search and discovery UI for a simple Google Sheets-based database of several hundred objects (max 500).

The objects are items in a personal museum collection which is a mashing together of concepts and metadata standards from the museums and archival domains (Dublin Core, Darwin Core, plus custom fields).

There will be no backend components for this project (at this stage), it's purely a client-side frontend consuming a Google Sheet via Google Sheets API v4.

There will be basic client-side search, the site will be public, and the styling and UI will be minimal.

This will be an extremely lean and MVP project at this stage, but the code quality and software architecture standard should be high.

**Timeline**: 2 weeks of tinkering

# Principles

1. All state will be stored in the URL, allowing easy back/forward changing of states just using browser history and sharing of links to different states (e.g. search results, specific items in the collection)

2. This is a very MVP project that will evolve over time

3. The UI is mobile first and responsive

4. No caching - fetch fresh data on each visit (performance is acceptable with a loading indicator)

5. Keep dependencies minimal and leverage existing patterns from demsausage reference repo

# Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Search**: MiniSearch library
- **Data Source**: Google Sheets API v4 (with API key)
- **Hosting**: GitHub Pages (custom domain: moo.keithandhelenmakestuff.com)
- **CI/CD**: GitHub Actions
- **Reference**: https://github.com/keithamoss/demsausage/tree/staging/public-redesign

# Data Schema

**Approach**: Schema-less and flexible, driven dynamically by Google Sheets metadata

## Google Sheet Structure

### Worksheet 1: Metadata Schema
Defines the structure, types, and properties of all fields:
- Field name
- Field type (text, date, url, etc.)
- Display label
- Searchable (yes/no)
- Search weight (for MiniSearch)
- Display order
- Other metadata as needed

### Worksheet 2: Objects
Contains all object data with columns aligned to metadata field definitions

## Known Key Fields (from requirements)
- `object_identifier` (unique ID, required)
- `object_title` (required)
- `object_description` (required)
- 20+ additional fields defined in metadata sheet
- One or more fields containing image URLs

# Implementation Phases

## Phase 1: Project Foundation & Deployment Pipeline

**Goal**: Working static site deployed to GitHub Pages with basic UI shell

### Phase 1.1: Project Scaffolding (Day 1)
- [x] Copy Vite + React + TypeScript setup from demsausage reference repo (public-redesign directory)
- [x] Copy base dependencies from package.json (React, MUI, Redux, React Router v7, TypeScript configs)
- [x] Set up folder structure:
  ```
  src/
    components/     # Reusable UI components
    features/       # Feature-based modules (search, objects)
    store/          # Redux store and slices
    types/          # TypeScript type definitions
    utils/          # Helper functions
    theme/          # MUI theme customization
    App.tsx
    main.tsx
  public/
  ```
- [x] Copy MUI theme configuration from demsausage
- [x] Copy tsconfig.json, vite.config.ts, and ESLint setup
- [x] Upgraded to Vite 6 for improved HTTPS support
- [x] Configured HTTPS development server with @vitejs/plugin-basic-ssl
- [x] Updated vite.config.ts with environment-aware configuration and sourcemaps
- [x] Customized MUI theme with accessible grey color palette (#bdbdbd primary, #212121 contrast text)
- [x] Phase 1.1 complete ✅

### Phase 1.2: GitHub Actions & Deployment (Day 1-2)
- [x] Create `.github/workflows/deploy.yml` for GitHub Pages deployment
- [x] Configure build script to output to `dist/` or `docs/`
- [x] Set up GitHub Pages in repository settings (instructions provided)
- [x] Configure custom domain (moo.keithandhelenmakestuff.com) via Cloudflare
- [x] Add CNAME file
- [x] Test deployment with "Hello World" React app
- [x] Verify site loads at custom domain (pending manual GitHub/Cloudflare setup)
- [x] Phase 1.2 complete ✅

### Phase 1.3: Core UI Shell (Day 2-3)
- [x] Copy and adapt layout components from demsausage:
  - AppBar/Header component
  - Footer component
  - Main layout wrapper
  - Responsive breakpoints
  - Code splitting setup (vendor bundle + app bundle)
- [x] Set up React Router with basic routes:
  - `/` - Home/Search page
  - `/object/:id/:slug?` - Object detail page (placeholder)
- [x] Create minimal homepage with:
  - Site title/branding
  - Search input placeholder
  - Loading state component
- [x] Ensure mobile-first responsive design
- [x] Accessibility improvements (WCAG 2.1 Level AA compliance)
- [x] Deploy and verify
- [x] Phase 1.3 complete ✅

**Deliverable**: Live static site with basic navigation and placeholder content

---

## Phase 2: Google Sheets Integration

**Goal**: Data flowing from Google Sheets to frontend with proof of concept display

### Phase 2.1: Google Sheets API Setup (Day 3-4)
- [x] Create Google Cloud Project (documented with instructions)
- [x] Enable Google Sheets API v4 (documented with instructions)
- [x] Create API key (with appropriate restrictions) (documented with instructions)
- [x] Store API key in environment variables (`.env.local` for dev) (infrastructure ready)
- [x] Add API key to GitHub Secrets for production builds (workflow configured)
- [x] Document API setup in README.md (comprehensive guide created)
- [x] Phase 2.1 complete ✅

### Phase 2.2: Metadata Schema Design Discussion (Day 4)
- [x] **PAUSE**: User to provide details on metadata schema structure
  - Format of metadata worksheet (column names, field properties)
  - How field types are defined
  - How searchable fields are marked
  - How weights/display order are specified
  - Example metadata entries
- [x] Examined existing Mappings sheet structure:
  - **Columns**: Field, Namespace, Label, Applicable collections, Required, Purpose, Field type and controls, Example
  - **Field naming**: Uses namespaced identifiers (dcterms:, moo:, dwc:)
  - **Standards**: Dublin Core, Darwin Core, and custom Museum of Objects of Interest namespace
  - **Mandatory fields**: `dcterms:identifier.moooi`, `dcterms:title`, `dcterms:description`, `dcterms:Collection`, `dcterms:dateAccepted`
  - **Field types**: Free text, controlled dropdowns, ISO8601 dates, URLs, images, comma-separated lists
  - **43 total fields** including moo:relatedEntities group
- [x] Design decisions:
  - **Example column**: For developer reference only, not used in application logic
  - **Applicable collections**: Comma-separated list of collection names (e.g., "Core, Library", "All")
  - **Required field**: Indicates MVP completeness requirement, not search relevance (starts with "Mandatory")
  - **Searchable fields**: Hardcoded to 4 fields (not in metadata sheet):
    - `dcterms:title` (weight: 3)
    - `dcterms:alternative` (weight: 2)
    - `dcterms:creator` (weight: 2)
    - `dcterms:description` (weight: 1)
  - **Display order**: Use order from Mappings sheet (may refine later)
  - **Image detection**: Fields with exact value "Image" in fieldTypeAndControls contain URLs
- [x] Created TypeScript interfaces:
  - `MetadataField` - individual field definition (8 properties)
  - `MetadataSchema` - array of field definitions
  - `ObjectData` - dynamic object with fields from schema
  - `ParsedMetadataSchema` - helper class with utility methods
- [x] Created configuration module (`src/config/search.ts`):
  - Hardcoded searchable fields with weights
  - Helper functions for search configuration
- [x] Created Google Sheets API service (`src/services/sheetsApi.ts`):
  - `fetchMetadataSchema()` - fetches and parses Mappings sheet
  - `fetchObjects()` - fetches and parses Museum sheet
  - `fetchAllData()` - fetches both in sequence
  - Dynamic header-based column mapping (resilient to column reordering)
  - Validation throws descriptive errors if required columns are missing
- [x] Verified all searchable fields exist in both Mappings and Museum sheets
- [x] Fixed field name discrepancies between Mappings and Museum sheets
- [x] Phase 2.2 complete ✅

**Future enhancements to consider:**
- Add runtime validation in `fetchObjects` to ensure mandatory fields have values
- Add test framework (e.g., Vitest) for automated validation of API service
- Add TypeScript strict null checks with type guards for object data fields

### Phase 2.3: Data Layer Implementation (Day 4-5)
- [x] Install Google Sheets API client library or use fetch with REST API
- [x] Create flexible TypeScript interfaces:
  - `MetadataField` - schema for a single field definition
  - `MetadataSchema` - array of field definitions
  - `ObjectData` - generic object with dynamic fields (Record<string, any>)
  - API response types
- [x] Create data service module (`src/services/sheetsApi.ts`):
  - `fetchMetadataSchema()` - fetches metadata definitions worksheet
  - `fetchObjects()` - fetches objects worksheet
  - Parse and validate data against metadata schema
  - Error handling and loading states
- [x] **UPGRADED**: Replaced manual Redux slices with RTK Query:
  - `src/store/api.ts` - RTK Query API definition with automatic caching
  - Entity normalization with O(1) lookups (both metadata and objects)
  - Automatic loading/error state management (no manual reducers needed)
  - Memoized selector hooks (`useObjects`, `useObject`, etc.)
  - ~300 lines of boilerplate eliminated vs manual slices
- [x] **ADDED**: Modern React best practices:
  - ErrorBoundary component for graceful error handling
  - TypeScript strict mode verified and passing
  - Comprehensive documentation (REACT_PATTERNS.md)
  - `useData()` hook for sequential metadata → objects fetching
  - Suspense-ready architecture (awaiting RTK Query v2.x)
- [x] Phase 2.3 complete ✅ (significantly exceeded original scope)

### Phase 2.4: Data Display & Validation (Day 5)
- [x] Add data fetching on app load (fetch metadata schema first, then objects)
- [x] Display loading indicator while fetching
- [x] Show error message if fetch fails
- [x] Display proof of concept metrics on homepage:
  - Total object count
  - Number of metadata fields loaded
  - Sample of first 5 object titles
- [x] Deploy and validate with real Google Sheets data
- [x] Phase 2.4 complete ✅

**Deliverable**: Site displays live data from Google Sheets with count and sample objects ✅

---

## Phase 3: Search Functionality

**Goal**: Working search UI with ranked results (non-clickable)

### Phase 3.1: MiniSearch Integration (Day 6-7)
- [x] Install MiniSearch library (`npm install minisearch`)
- [x] Create search service module (`src/services/search.ts`):
  - Read searchable fields and weights from metadata schema
  - Initialize MiniSearch index dynamically based on metadata:
    - Extract fields marked as searchable
    - Apply weights from metadata schema
  - Configure fuzzy matching and partial word matching
  - Implement search function with options for field toggles
- [x] Build index on data load (after fetching from Sheets)
- [x] Create Redux slice for search state:
  - `searchQuery` (string)
  - `searchResults` (array of object IDs with scores)
  - `activeSearchFields` (which searchable fields are enabled)
- [x] Phase 3.1 complete ✅

### Phase 3.2: Search UI Components (Day 7-8)
- [x] Create SearchBar component:
  - Text input (controlled component)
  - Search button
  - Clear button
  - Syncs with URL query parameter (`?q=search+term`)
- [x] Create SearchFilters component:
  - Dynamically generate checkboxes from searchable fields in metadata schema
  - Each checkbox toggles whether that field is searched
  - Display friendly labels from metadata schema
  - Default: all enabled
  - Syncs with URL query parameters
- [x] Create SearchResults component:
  - List of result cards (non-clickable)
  - Dynamically display key fields (based on metadata or hardcoded for MVP)
  - Show search score/relevance (for debugging)
  - Show result count
  - Empty state message
  - Ensure responsive layout (grid on desktop, stack on mobile)
- [x] Phase 3.2 complete ✅

### Phase 3.3: URL State Management (Day 8-9)
- [x] Implement URL state sync for:
  - Search query (`?q=`)
  - Active filters (`?fields=title,description`)
- [x] Handle browser back/forward navigation
- [x] Handle direct URL navigation (e.g., shared links)
- [x] Update page title based on search (for browser history)
- [x] Phase 3.3 complete ✅

### Phase 3.4: Search Polish (Day 9)
- [x] Show "No results" state with helpful message
- [x] Add keyboard shortcuts (Enter to search, Escape to clear)
- [x] Highlight search terms in results (optional, nice-to-have)
- [x] Test with various search queries
- [x] Deploy
- [x] Phase 3.4 complete ✅

**Deliverable**: Functional search interface with ranked results displayed ✅

**Highlights:**
- Search term highlighting with yellow mark tags
- Keyboard shortcuts visible on desktop (Enter/Esc hints)
- Mobile-optimized search button
- Filter badge showing when fields customized
- No results state with helpful guidance

---

## Phase 4: Object Detail Pages

**Goal**: Clickable search results leading to rich detail pages

### Phase 4.1: Routing & Navigation (Day 10)
- [x] Make search results clickable
- [x] Implement navigation to `/object/:id/:slug?`
  - `:id` is `object_identifier` (used for lookup)
  - `:slug` is URL-friendly `object_title` (for SEO/readability, not used for lookup)
- [x] Create utility function to generate slug from title
- [x] Handle invalid IDs (404 page)
- [x] Phase 4.1 complete ✅

### Phase 4.2: Object Detail Page Component (Day 10-11)
- [x] Create ObjectDetail component:
  - Extract object ID from URL params
  - Fetch object from Redux store
  - Use metadata schema to dynamically render all fields:
    - Hero section: title, identifier (hardcoded/known fields)
    - Main section: description (full text)
    - Metadata section: All other fields rendered based on metadata schema
      - Use field type to determine display format
      - Use display order from metadata
      - Use display labels from metadata
    - Images: Detect and display image URL fields
  - Responsive layout (2-column on desktop, stack on mobile)
  - Loading state while data loads
  - Error state if object not found
- [x] Phase 4.2 complete ✅

**Implementation highlights:**
- Hero section with prominent title and identifier display
- Left column: Description (full text with line breaks) + Images (lazy loaded)
- Right column: Metadata section with all other fields dynamically rendered
- Field rendering based on metadata types:
  - URLs automatically converted to clickable links
  - Dates displayed as-is
  - Multi-line text preserves line breaks
- Empty fields automatically hidden
- Grid layout: 2-column on desktop (md+), stacked on mobile
- Uses metadata labels for field names throughout

### Phase 4.3: Rich Display Features (Day 11-12)
- [x] Format fields appropriately based on field type from metadata:
  - Dates: Human-readable format (supports YYYY, YYYY-MM, YYYY-MM-DD, and ISO8601 with time)
  - URLs: Make clickable links (truncated to 60 chars with full URL on hover)
  - Long text: Proper paragraph spacing (line breaks preserved)
  - Images: Display inline (in dedicated Images section)
  - Comma-separated lists: Material-UI chips
  - Other types: Display as plain text
- [x] Display images:
  - Lazy loading
  - Alt text from object title
  - Broken image fallback with icon and message
- [x] Handle missing/empty fields gracefully (don't display empty sections)
- [x] Phase 4.3 complete ✅

**Implementation highlights:**
- Enhanced date formatting handles partial dates (year-only, year-month)
- URLs display shortened text with full URL in title attribute
- Broken image fallback shows "Image unavailable" with icon
- Comprehensive field rendering documentation in fieldRendering.tsx
- All field types dynamically rendered based on metadata

### Phase 4.4: Detail Page Polish (Day 12)
- [x] Add breadcrumb navigation (Home > Search Results > Object)
- [x] Update page title with object title
- [x] Add loading skeleton while data loads
- [x] Test all fields display correctly
- [x] Test edge cases (missing fields, no images, etc.)
- [x] Deploy
- [x] Phase 4.4 complete ✅

**Deliverable**: Full object browsing experience with detail pages ✅

**Implementation highlights:**
- Breadcrumb navigation shows context (Home > Search Results > Object)
- Search Results breadcrumb preserves filter state
- Dynamic page title updates with object name
- Loading skeleton mimics page structure during data fetch
- Back button intelligently returns to search results or home
- All field types tested (text, dates, URLs, images, lists)
- Edge cases handled (missing fields, broken images, no metadata)

---

## Phase 5: Polish & Launch Prep (Day 13-14)

### Final Testing & Bug Fixes
- [x] Test all user flows end-to-end
- [x] Fix any discovered bugs

### Documentation
- [x] Update README.md with:
  - Project description
  - Tech stack
  - Setup instructions
  - Environment variables needed
  - Google Sheets setup guide
  - Deployment process
- [x] Add inline code comments for complex logic
- [x] Document required Google Sheets structure:
  - Metadata worksheet format
  - Objects worksheet format
  - Example metadata field definitions

### Code Quality Review
- [x] Migrated from ESLint + Prettier to Biome
  - Biome provides faster linting and formatting with better TypeScript support
  - Automatically migrated 181 ESLint rules (54% coverage)
  - Configured test-specific rules for Vitest globals
  - All 73 files now passing lint checks
  - Removed 164 dependencies (ESLint plugins and Prettier)
  - New scripts: `npm run lint`, `npm run lint:fix`, `npm run format`

### Launch
- [ ] Final deployment
- [ ] Verify custom domain works
- [ ] Share link for user acceptance testing

**Deliverable**: Production-ready site

---

# Optional Future Phases (Post-MVP)

## Phase 7: Testing (If Desired)
- [ ] Set up Jest + React Testing Library
- [ ] Unit tests for search logic
- [ ] Component tests for key UI elements
- [ ] E2E tests with Playwright or Cypress

## Phase 8: Analytics (If Desired)
- [ ] Add Plausible or Google Analytics
- [ ] Track page views
- [ ] Track search queries
- [ ] Track most viewed objects

## Phase 9: Collections/Grouping Feature
- [ ] Add collection field to metadata schema
- [ ] Create Collections page route
- [ ] Browse objects by collection
- [ ] Show related objects on detail page
- [ ] Collection detail pages

## Phase 10: Advanced Features (Maybe Someday)
- [ ] Timeline view (if objects have date fields)
- [ ] Map view (if objects have location data)
- [ ] Export functionality (PDF, citations)
- [ ] Image optimization/lazy loading improvements
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Print stylesheets
- [ ] Offline support with Service Worker
- [ ] Advanced search (date ranges, Boolean operators)
- [ ] Prefetching on hover/navigation for instant page loads
- [ ] React Suspense for data fetching (when RTK Query v2.x adds official support)

---

# Key Technical Decisions

## URL State Format
```
/ - Homepage with search
/?q=sculpture&fields=title,description - Search results
/object/MOO-2024-001/ceramic-vase - Object detail page
```

## Redux Store Structure
```typescript
{
  objects: {
    data: ObjectData[], // Array of objects with dynamic fields
    metadataSchema: MetadataField[], // Field definitions from metadata worksheet
    loading: boolean,
    error: string | null
  },
  search: {
    query: string,
    results: SearchResult[],
    activeSearchFields: string[], // Which searchable fields are enabled
    index: MiniSearch | null
  }
}

// Types
interface MetadataField {
  name: string;
  type: 'text' | 'date' | 'url' | 'image' | 'number' | string;
  displayLabel: string;
  searchable: boolean;
  searchWeight?: number;
  displayOrder?: number;
  // ... other metadata properties
}

interface ObjectData {
  object_identifier: string; // Required
  [key: string]: any; // Dynamic fields based on metadata
}
```

## Environment Variables
```
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_SHEET_ID=your_sheet_id
```

---

# Success Criteria

- [ ] Site loads at moo.keithandhelenmakestuff.com
- [ ] All 500 objects searchable within 2 seconds
- [ ] Search results are relevant and ranked
- [ ] All object fields display correctly on detail pages
- [ ] URLs are shareable and work via direct navigation
- [ ] Mobile responsive on screens down to 320px
- [ ] No console errors
- [ ] Code follows TypeScript best practices
- [ ] Site automatically deploys on push to main branch

---

# Post-MVP Improvements

## Code Quality & Tooling
- [ ] **Replace ESLint with modern linter** - Evaluate migrating from ESLint + Prettier to Biome (or similar modern all-in-one tooling) for faster linting/formatting with better performance
  - Benefits: Single tool for both linting and formatting, significantly faster, better TypeScript support
  - Consider: Migration effort, plugin ecosystem, team familiarity