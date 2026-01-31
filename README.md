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
- 🔲 Google Sheets API integration
- 🔲 Client-side search with MiniSearch
- 🔲 Object detail pages
- 🔲 Mobile-responsive design
- 🔲 URL-based state management
- 🔲 GitHub Pages deployment

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
