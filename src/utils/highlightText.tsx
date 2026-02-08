/**
 * Utility for highlighting search terms in text
 */

import { Fragment } from 'react';

/**
 * Highlight matching search terms in text
 * @param text - The text to search within
 * @param query - The search query (can be multiple words)
 * @returns Array of text fragments with highlighted portions
 */
export function highlightSearchTerms(text: string, query: string): React.ReactNode[] {
  if (!text || !query || query.trim() === '') {
    return [text];
  }

  // Extract individual words from query (split by whitespace)
  const searchTerms = query
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => term.toLowerCase());

  if (searchTerms.length === 0) {
    return [text];
  }

  // Build a regex pattern that matches any of the search terms (case-insensitive)
  // Escape special regex characters in search terms
  const escapedTerms = searchTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  // Split text by matches, keeping the matched portions
  const parts = text.split(pattern);

  // Map parts to text/highlighted elements
  return parts.map((part, index) => {
    // Check if this part matches any search term (case-insensitive)
    const isMatch = searchTerms.some((term) => part.toLowerCase() === term);

    if (isMatch) {
      return (
        <mark
          key={index}
          style={{
            backgroundColor: '#ffeb3b',
            color: 'inherit',
            padding: '0 2px',
            fontWeight: 500,
          }}
        >
          {part}
        </mark>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}
