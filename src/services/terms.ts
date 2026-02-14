/**
 * Terms extraction service for type-ahead suggestions
 * Extracts and indexes unique terms from object metadata for autocomplete
 */

import { ALL_SEARCHABLE_FIELD_NAMES, type SearchableFieldName } from '../config/searchConfig';
import type { ObjectData } from '../types/metadata';

/**
 * Term suggestion with metadata
 */
export interface TermSuggestion {
	/** The term itself */
	readonly term: string;
	/** Frequency count (number of times this term appears) */
	readonly frequency: number;
	/** Which fields this term appears in */
	readonly fields: Set<SearchableFieldName>;
}

/**
 * Service for extracting and managing searchable terms from metadata
 */
export class TermsService {
	private termsMap: Map<string, TermSuggestion> = new Map();
	private allTerms: string[] = [];

	/**
	 * Build terms index from objects
	 * Extracts unique words/terms from all searchable fields
	 */
	buildIndex(objects: ObjectData[]): void {
		// Clear existing index
		this.termsMap.clear();

		// Track terms and their metadata
		const tempTermsMap = new Map<string, { frequency: number; fields: Set<SearchableFieldName> }>();

		// Extract terms from each object
		for (const obj of objects) {
			for (const fieldName of ALL_SEARCHABLE_FIELD_NAMES) {
				const fieldValue = obj[fieldName];
				if (!fieldValue || typeof fieldValue !== 'string') {
					continue;
				}

				// Extract terms (split by whitespace and common delimiters)
				const terms = this.extractTerms(fieldValue);

				// Add each term to the index
				for (const term of terms) {
					const normalized = term.toLowerCase();

					// Skip very short terms (single characters)
					if (normalized.length < 2) {
						continue;
					}

					const existing = tempTermsMap.get(normalized);
					if (existing) {
						existing.frequency++;
						existing.fields.add(fieldName);
					} else {
						tempTermsMap.set(normalized, {
							frequency: 1,
							fields: new Set([fieldName]),
						});
					}
				}
			}
		}

		// Convert to final format
		for (const [term, data] of tempTermsMap.entries()) {
			this.termsMap.set(term, {
				term,
				frequency: data.frequency,
				fields: data.fields,
			});
		}

		// Create sorted array of all terms (by frequency, then alphabetically)
		this.allTerms = Array.from(this.termsMap.keys()).sort((a, b) => {
			const freqA = this.termsMap.get(a)?.frequency ?? 0;
			const freqB = this.termsMap.get(b)?.frequency ?? 0;

			// Sort by frequency (descending), then alphabetically
			if (freqB !== freqA) {
				return freqB - freqA;
			}
			return a.localeCompare(b);
		});
	}

	/**
	 * Extract terms from a text value
	 * Splits on whitespace and common delimiters, preserves hyphenated words
	 */
	private extractTerms(text: string): string[] {
		// Split on whitespace, commas, semicolons, periods, parentheses, quotes, brackets
		// but preserve hyphenated words
		return text
			.split(/[\s,;.()"'[\]{}!?]+/)
			.map((term) => {
				// Trim whitespace and remove leading/trailing punctuation
				return term.trim().replace(/^[!?.:;,']+|[!?.:;,']+$/g, '');
			})
			.filter((term) => term.length > 0);
	}

	/**
	 * Get term suggestions matching a prefix
	 * Returns ranked list of matching terms
	 */
	getSuggestions(prefix: string, maxResults = 10): string[] {
		if (!prefix || prefix.length < 1 || maxResults <= 0) {
			return [];
		}

		const normalizedPrefix = prefix.toLowerCase();

		// Find matching terms
		const matches: string[] = [];

		for (const term of this.allTerms) {
			if (term.startsWith(normalizedPrefix)) {
				matches.push(term);

				// Limit results
				if (matches.length >= maxResults) {
					break;
				}
			}
		}

		return matches;
	}

	/**
	 * Get all unique terms (sorted by frequency)
	 */
	getAllTerms(): string[] {
		return [...this.allTerms];
	}

	/**
	 * Get term details
	 */
	getTermDetails(term: string): TermSuggestion | undefined {
		return this.termsMap.get(term.toLowerCase());
	}

	/**
	 * Get total number of unique terms
	 */
	getTermCount(): number {
		return this.termsMap.size;
	}

	/**
	 * Check if index is ready
	 */
	isReady(): boolean {
		return this.termsMap.size > 0;
	}

	/**
	 * Clear the index
	 */
	clear(): void {
		this.termsMap.clear();
		this.allTerms = [];
	}
}

// Export singleton instance
export const termsService = new TermsService();
