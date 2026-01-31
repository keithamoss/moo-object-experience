# Google Sheets API Setup Guide

This guide walks you through setting up the Google Sheets API integration for the Museum Object Experience project.

## Overview

The application uses Google Sheets API v4 to fetch museum object data from a Google Sheet. This requires:
1. A Google Cloud Project
2. Google Sheets API v4 enabled
3. An API key with appropriate restrictions
4. A publicly accessible Google Sheet
5. Credentials added to the config file (`src/config/sheets.ts`)

**Note**: The API key and Sheet ID are intentionally public (they'll be visible in browser network requests). Security is provided through HTTP referrer restrictions on the API key, preventing unauthorized use from other domains.

## Step-by-Step Setup

### 1. Create a Google Cloud Project

In [Google Cloud Console](https://console.cloud.google.com/), create a new project (e.g., "Museum Object Experience").

### 2. Enable Google Sheets API v4

Go to **APIs & Services > Library**, search for "Google Sheets API", and enable it.

### 3. Create and Restrict an API Key

In **APIs & Services > Credentials**, create an API key and configure restrictions:

**API Restrictions:**
- Restrict to Google Sheets API only

**Application Restrictions (recommended):**
- HTTP referrers: `moo.keithandhelenmakestuff.com/*`, `localhost/*`

Note: The API key will be visible in browser network requests. Restrictions prevent unauthorized use.

### 4. Prepare Your Google Sheet

**Make publicly accessible:** Share > "Anyone with the link" > Viewer

**Get Sheet ID:** Extract from URL between `/d/` and `/edit`
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
```

**Expected structure:**
- Worksheet 1 ("Mappings"): Metadata schema defining field names, types, searchability
- Worksheet 2 ("Museum"): Object data with columns matching metadata definitions

### 5. Add Credentials to Config File

Update `src/config/sheets.ts` with your API key and Sheet ID:
```typescript
export const SHEETS_CONFIG = {
  apiKey: 'AIzaSyD...your_actual_api_key_here',
  sheetId: '1abc123XYZ...your_actual_sheet_id_here',
  // ...
};
```

### 6. Verify

Once data fetching is implemented, check DevTools Network tab for requests to `sheets.googleapis.com` (should return 200).

## Troubleshooting

**"API key not valid"**: Verify API key in config, ensure Sheets API is enabled, check referrer restrictions

**"The caller does not have permission"**: Sheet must be public ("Anyone with link can view"), verify Sheet ID

**Unable to parse range**: Worksheet name doesn't exist, check actual worksheet names in your sheet

## Security

The API key is intentionally public and committed to git. This is acceptable because:
- Sheet is public (read-only)
- HTTP referrer restrictions prevent external use
- Key restricted to Sheets API only
- Standard pattern for public read-only integrations

Best practices: Rotate keys periodically, monitor usage in GCP Console, set billing alerts.

## Quotas

- 60 requests/min per user
- 500 requests/100s per project  
- 60,000 requests/day (free)

Sufficient for MVP with no caching. Request increases in GCP Console if needed.

## Resources

- [Sheets API v4 Docs](https://developers.google.com/sheets/api/reference/rest)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
