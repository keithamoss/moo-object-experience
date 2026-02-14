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
	const trimmedText = text?.trim();
	const trimmedQuery = query?.trim();
	
	if (!trimmedText || !trimmedQuery) {
		return [text ?? ''];
	}

	// Extract individual words from query (split by whitespace)
	// Example: "stone axe" → ["stone", "axe"]
	const searchTerms = trimmedQuery
		.split(/\s+/) // Split on one or more whitespace characters
		.filter((term) => term.length > 0) // Remove empty strings
		.map((term) => term.toLowerCase()); // Normalize to lowercase for case-insensitive matching

	if (searchTerms.length === 0) {
		return [text];
	}

	// Build a regex pattern that matches any of the search terms (case-insensitive)
	// Example: ["stone", "axe"] → /(stone|axe)/gi

	// Escape special regex characters in search terms to prevent injection
	// This ensures terms like "C++" become "C\\+\\+" and don't break the regex
	const escapedTerms = searchTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

	// Create alternation pattern with global case-insensitive matching
	// The parentheses create a capture group, which split() will keep in the result
	const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

	// Split text by matches, keeping the matched portions
	// Example: "Aboriginal stone axe head" with pattern /(stone|axe)/gi
	// → ["Aboriginal ", "stone", " ", "axe", " head"]
	const parts = text.split(pattern);

	// Map parts to text/highlighted elements
	// Each part is either matched text (highlight it) or unmatched text (leave as-is)
	return parts.map((part, index) => {
		// Check if this part matches any search term (case-insensitive)
		// We need this extra check because split() doesn't tell us which parts were matches
		const isMatch = searchTerms.some((term) => part.toLowerCase() === term);

		if (isMatch) {
			// This part matched a search term - wrap it in a <mark> element for highlighting
			return (
				<mark
					key={`${index}-${part}`}
					style={{
						backgroundColor: '#ffeb3b', // Yellow highlight (Material Design Yellow 400)
						color: 'inherit', // Keep text color from parent
						padding: '0 2px', // Subtle padding for better visual separation
						fontWeight: 500, // Slightly bolder to draw attention
					}}
				>
					{part}
				</mark>
			);
		}

		// This part didn't match - return as plain text wrapped in Fragment
		// Fragment avoids adding extra DOM nodes while satisfying React's key requirement
		return <Fragment key={`${index}-${part}`}>{part}</Fragment>;
	});
}
