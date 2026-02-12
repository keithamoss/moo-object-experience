/**
 * Google Sheets API service for fetching metadata schema and object data
 */

import { SHEETS_CONFIG } from '../config/sheets';
import type { MetadataSchema, ObjectData, SheetsApiResponse } from '../types/metadata';

/**
 * Build the URL for fetching a specific worksheet
 */
function buildSheetUrl(worksheetName: string): string {
  const { baseUrl, sheetId, apiKey } = SHEETS_CONFIG;
  return `${baseUrl}/${sheetId}/values/${encodeURIComponent(worksheetName)}?key=${apiKey}`;
}

/**
 * Fetch data from a Google Sheet worksheet
 */
async function fetchSheetData(worksheetName: string): Promise<string[][]> {
  const url = buildSheetUrl(worksheetName);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${worksheetName}: ${response.status} ${response.statusText}`);
  }

  const data: SheetsApiResponse = await response.json();

  if (!data.values || data.values.length === 0) {
    throw new Error(`No data found in ${worksheetName} worksheet`);
  }

  return data.values;
}

/**
 * Parse the Mappings worksheet into a structured metadata schema
 */
export function parseMetadataSchema(rows: string[][]): MetadataSchema {
  if (rows.length < 2) {
    throw new Error('Mappings sheet must have at least a header row and one data row');
  }

  // First row contains headers
  const headers = rows[0];

  // Map headers to their indices (case-insensitive, flexible matching)
  const headerMap = new Map<string, number>();
  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();
    headerMap.set(normalized, index);
  });

  // Required headers with flexible matching patterns
  const requiredHeaders = [
    { key: 'field', patterns: ['field'] },
    { key: 'namespace', patterns: ['namespace'] },
    { key: 'label', patterns: ['label'] },
    { key: 'applicableCollections', patterns: ['applicable collections'] },
    { key: 'required', patterns: ['required'] },
    { key: 'purpose', patterns: ['purpose'] },
    { key: 'fieldTypeAndControls', patterns: ['field type'] },
    { key: 'example', patterns: ['example'] },
  ];

  // Find column indices for each required header
  const columnIndices: Record<string, number> = {};
  const missingHeaders: string[] = [];

  for (const { key, patterns } of requiredHeaders) {
    let found = false;
    for (const pattern of patterns) {
      const matchingHeader = Array.from(headerMap.entries()).find(([header]) => header.includes(pattern));
      if (matchingHeader) {
        columnIndices[key] = matchingHeader[1];
        found = true;
        break;
      }
    }
    if (!found) {
      missingHeaders.push(patterns[0]);
    }
  }

  // Throw error if critical columns are missing
  if (missingHeaders.length > 0) {
    throw new Error(
      `Mappings sheet is missing required columns: ${missingHeaders.join(', ')}. ` +
        `Found columns: ${headers.join(', ')}`,
    );
  }

  // Parse data rows using the column mapping
  const schema: MetadataSchema = rows
    .slice(1)
    .filter((row) => row[columnIndices.field] && row[columnIndices.field].trim() !== '') // Filter out empty rows
    .map((row) => ({
      field: row[columnIndices.field] || '',
      namespace: row[columnIndices.namespace] || '',
      label: row[columnIndices.label] || '',
      applicableCollections: row[columnIndices.applicableCollections] || '',
      required: row[columnIndices.required] || '',
      purpose: row[columnIndices.purpose] || '',
      fieldTypeAndControls: row[columnIndices.fieldTypeAndControls] || '',
      example: row[columnIndices.example] || '',
    }));

  return schema;
}

/**
 * Parse the Museum (objects) worksheet into structured object data
 */
export function parseObjectsData(rows: string[][], schema: MetadataSchema): ObjectData[] {
  if (rows.length < 2) {
    throw new Error('Museum sheet must have at least a header row and one data row');
  }

  // First row contains field names (should match schema field names)
  const fieldNames = rows[0];

  // Find the index of the identifier field
  const identifierIndex = fieldNames.findIndex((field) => field === 'dcterms:identifier.moooi');

  // Parse data rows (skip header)
  const objects: ObjectData[] = rows
    .slice(1)
    .filter((row) => {
      // Only include rows that have a non-empty identifier (required field)
      const identifier = row[identifierIndex];
      if (!identifier || identifier.trim() === '') {
        console.warn('Skipping object row with missing identifier');
        return false;
      }
      return true;
    })
    .map((row) => {
      const obj: ObjectData = {};

      fieldNames.forEach((fieldName, index) => {
        if (fieldName && fieldName.trim() !== '') {
          obj[fieldName] = row[index] || '';
        }
      });

      // Validate required fields exist
      const identifier = obj['dcterms:identifier.moooi'];
      if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
        throw new Error(`Object missing required identifier field`);
      }

      return obj;
    });

  return objects;
}

/**
 * Fetch and parse the metadata schema from the Mappings worksheet
 */
export async function fetchMetadataSchema(): Promise<MetadataSchema> {
  try {
    const rows = await fetchSheetData(SHEETS_CONFIG.worksheets.metadata);
    return parseMetadataSchema(rows);
  } catch (error) {
    console.error('Error fetching metadata schema:', error);
    throw error;
  }
}

/**
 * Fetch and parse object data from the Museum worksheet
 */
export async function fetchObjects(schema: MetadataSchema): Promise<ObjectData[]> {
  try {
    const rows = await fetchSheetData(SHEETS_CONFIG.worksheets.objects);
    return parseObjectsData(rows, schema);
  } catch (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }
}

/**
 * Fetch both metadata schema and objects in sequence
 * (metadata must be fetched first to properly parse objects)
 */
export async function fetchAllData(): Promise<{
  schema: MetadataSchema;
  objects: ObjectData[];
}> {
  const schema = await fetchMetadataSchema();
  const objects = await fetchObjects(schema);

  return { schema, objects };
}
