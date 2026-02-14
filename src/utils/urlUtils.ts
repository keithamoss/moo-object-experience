/**
 * URL utility functions
 */

/**
 * Generate a URL-friendly slug from a string
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start and end
 * - Limits length to 50 characters
 *
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug (may be empty if text has no valid characters)
 *
 * @example
 * generateSlug('Aboriginal stone axe head') // 'aboriginal-stone-axe-head'
 * generateSlug('Map of W.A. (1950s)') // 'map-of-wa-1950s'
 * generateSlug('☆✿★') // ''
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase() // Convert to lowercase for URL consistency
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters (keep letters, numbers, spaces, hyphens)
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with single hyphens
    .replace(/-+/g, '-') // Collapse multiple consecutive hyphens into one
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .substring(0, 50); // Limit to 50 chars for reasonable URL length
}

/**
 * Validate that an object ID is safe for use in URLs
 * Rejects IDs with characters that cause routing issues
 *
 * @param id - Object identifier to validate
 * @returns true if ID is safe for URLs
 */
export function isValidObjectId(id: string): boolean {
  // Reject empty, very long, or IDs with problematic URL characters
  if (!id || id.length > 200) {
    return false;
  }
  // Reject forward slashes, backslashes, hash, question marks, and other URL-breaking chars
  const problematicChars = /[\/\\#?&%]/;
  return !problematicChars.test(id);
}

/**
 * Result of object URL validation
 */
export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  slug?: string;
}

/**
 * Validate that an object can be used in a URL
 * Checks both ID and title validity
 *
 * @param id - Object identifier
 * @param title - Object title
 * @returns Validation result with error message if invalid
 */
export function validateObjectForUrl(id: string, title: string): UrlValidationResult {
  if (!isValidObjectId(id)) {
    return { valid: false, error: `Invalid object ID for URL: ${id}` };
  }

  const slug = generateSlug(title);
  if (!slug) {
    return { valid: false, error: `Object has invalid title - cannot generate URL: ${title}` };
  }

  return { valid: true, slug };
}

/**
 * Generate a full object detail URL with ID and slug
 *
 * @param id - Object identifier (used for lookup)
 * @param title - Object title (used for SEO-friendly slug)
 * @returns Full URL path
 * @throws Error if ID contains problematic characters or title is invalid
 *
 * @example
 * generateObjectUrl('OBJ-001', 'Stone Axe') // '/object/OBJ-001/stone-axe'
 */
export function generateObjectUrl(id: string, title: string): string {
  const validation = validateObjectForUrl(id, title);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return `/object/${encodeURIComponent(id)}/${validation.slug}`;
}

/**
 * Build a search page URL from a query and optional search params
 * Preserves filter state if present in search params
 *
 * @param query - Search query string
 * @param searchParams - URLSearchParams containing optional filter state
 * @returns URL path with query parameters
 *
 * @example
 * buildSearchURL('pottery', new URLSearchParams()) // '/?q=pottery'
 * buildSearchURL('pottery', new URLSearchParams('fields=title,creator')) // '/?q=pottery&fields=title,creator'
 */
export function buildSearchURL(query: string, searchParams?: URLSearchParams): string {
  const params = new URLSearchParams();
  
  // Add query
  if (query) {
    params.set('q', query);
  }
  
  // Preserve fields filter if present
  if (searchParams?.has('fields')) {
    params.set('fields', searchParams.get('fields')!);
  }
  
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
}
