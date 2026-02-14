# Museum Object Experience

A simple frontend search and discovery UI for a personal museum collection backed by Google Sheets.

## Project Overview

This is a client-side web application that provides search and browse capabilities for a museum object collection stored in Google Sheets. The interface is minimal, mobile-first, and designed for MVP functionality with high code quality.

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Search**: MiniSearch library (client-side search)
- **Data Source**: Google Sheets API v4
- **Hosting**: GitHub Pages (planned)

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

- Node.js 20+ and npm
- A Google Cloud Project with Sheets API v4 enabled
- Google Sheets API key

### Google Sheets API Setup

#### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top of the page
3. Click "New Project" in the dialog that appears
4. Enter a project name (e.g., "Museum Object Experience")
5. Click "Create"

#### 2. Enable Google Sheets API v4

1. In your Google Cloud Project, navigate to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on "Google Sheets API" in the results
4. Click the "Enable" button

#### 3. Create an API Key

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" at the top
3. Select "API Key"
4. Your API key will be created and displayed
5. **Important**: Click "Edit API key" to restrict it:
   - Under "API restrictions", select "Restrict key"
   - Check "Google Sheets API" from the list
   - Under "Application restrictions" (recommended):
     - Select "HTTP referrers (web sites)"
     - Add your domain: `moo.keithandhelenmakestuff.com/*`
     - Add localhost for development: `localhost/*`
6. Click "Save"
7. Copy your API key

#### 4. Prepare Your Google Sheet

1. Create or open your Google Sheet containing the museum objects
2. Make the sheet publicly viewable:
   - Click "Share" in the top right
   - Under "General access", select "Anyone with the link" can "View"
   - Click "Done"
3. Get your Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Copy the `{SHEET_ID}` portion

#### 5. Add Credentials to Config File

1. Open `src/config/sheets.ts`
2. Replace the placeholder values:
   ```typescript
   apiKey: 'YOUR_ACTUAL_API_KEY',
   sheetId: 'YOUR_ACTUAL_SHEET_ID',
   ```
3. Commit and push to deploy

**Note**: The API key and Sheet ID are intentionally public (visible in browser network requests). Security is provided by HTTP referrer restrictions on the API key, which prevent it from being used on other domains

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd moo-object-experience
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Google Sheets API credentials to `.env.local`:
   ```
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
   VITE_GOOGLE_SHEET_ID=your_sheet_id_here
   ```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `https://localhost:5173` (served over HTTPS with auto-generated certificates)

### Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Linting

Run ESLint:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
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

## Key Features (Planned)

- ✅ Project scaffolding with React + TypeScript + Vite
- ✅ Material-UI theme and component library
- ✅ Redux Toolkit for state management
- ✅ React Router v7 for routing
- ✅ GitHub Pages deployment workflow
- 🔲 Google Sheets API integration
- 🔲 Client-side search with MiniSearch
- 🔲 Object detail pages
- 🔲 Mobile-responsive design
- 🔲 URL-based state management

## Deployment

The site automatically deploys to GitHub Pages on every push to the `main` branch.

- **Production URL**: https://moo.keithandhelenmakestuff.com
- **GitHub Pages URL**: https://keithamoss.github.io/moo-object-experience/
- **DNS Provider**: Cloudflare

### First-Time Setup

See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for detailed instructions on:
- Configuring GitHub Pages settings
- Setting up custom domain in Cloudflare DNS
- Adding API key secrets
- Troubleshooting deployment issues

### Deployment Process

1. Push changes to `main` branch
2. GitHub Actions automatically builds the site
3. Deploys to GitHub Pages
4. Site is live within 1-2 minutes

View deployment status in the **Actions** tab of the repository.

## Development Principles

1. **URL State**: All state stored in URL for shareable links and browser history
2. **MVP Focus**: Lean implementation that can evolve over time
3. **Mobile First**: Responsive design starting with mobile screens
4. **No Caching**: Fetch fresh data on each visit
5. **Minimal Dependencies**: Keep dependencies lean and purposeful

## Timeline

This is a 2-week MVP project with potential for future enhancements.

## Reference

Based on architecture patterns from [demsausage](https://github.com/keithamoss/demsausage) public-redesign implementation.

## License

[Your License Here]
