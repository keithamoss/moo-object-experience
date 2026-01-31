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

## Google Sheets Setup

Your Google Sheet should have two worksheets:

### Worksheet 1: Metadata Schema
Defines field structure, types, and properties:
- Field name
- Field type (text, date, url, etc.)
- Display label
- Searchable (yes/no)
- Search weight
- Display order
- Other metadata as needed

### Worksheet 2: Objects
Contains all object data with columns aligned to metadata field definitions:
- `object_identifier` (required, unique)
- `object_title` (required)
- `object_description` (required)
- Additional fields as defined in metadata

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
