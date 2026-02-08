/**
 * Google Sheets API Configuration
 *
 * Note: These values are intentionally public and will be visible in browser network requests.
 * The API key is restricted by HTTP referrer to only work from our domain.
 */

export const SHEETS_CONFIG = {
  // Your Google Sheets API key (restricted to Google Sheets API only and your domain)
  apiKey: 'AIzaSyD6ylA0hu7ULPtL0NwOwwo1vBNTp01jBew',

  // Your Google Sheet ID (found in the sheet URL between /d/ and /edit)
  sheetId: '1jarQ6R_kCPABkjqX6bM1OD5xsl0TCpMEwlc29ItqSp8',

  // Base URL for Google Sheets API v4
  baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets',

  // Worksheet names
  worksheets: {
    metadata: 'Mappings',
    objects: 'Museum',
  },
} as const;
