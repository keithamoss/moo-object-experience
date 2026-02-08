/**
 * Search service using MiniSearch
 * Provides full-text search across object data with configurable field weights
 */

import MiniSearch from 'minisearch';
import {
  ALL_SEARCHABLE_FIELD_NAMES,
  FIELD_WEIGHTS,
  FUZZY_TOLERANCE,
  SEARCH_COMBINE_MODE,
  SearchableFieldName,
} from '../config/searchConfig';
import type { ObjectData } from '../types/metadata';

/**
 * Search result with scoring information
 */
export interface SearchResult {
	/** Object identifier */
	id: string;
	/** Search relevance score */
	score: number;
	/** Matching terms per searchable field */
	match: Partial<Record<SearchableFieldName, string[]>>;
}

/**
 * Search options
 */
export interface SearchOptions {
	/** Which searchable fields to include (defaults to all) */
	activeFields?: SearchableFieldName[];
	/** Enable fuzzy matching (defaults to true) */
	fuzzy?: boolean | number;
	/** Enable prefix matching (defaults to true) */
	prefix?: boolean;
}

/**
 * Search service class that manages MiniSearch index
 */
export class SearchService {
	private miniSearch: MiniSearch<ObjectData> | null = null;

	private indexedObjects: ObjectData[] = [];

	/**
	 * Initialize and build the search index from objects
	 */
	buildIndex(objects: ObjectData[]): void {
		// Store objects for later reference
		this.indexedObjects = objects;

		// Initialize MiniSearch with dynamic fields
		this.miniSearch = new MiniSearch({
			fields: ALL_SEARCHABLE_FIELD_NAMES, // Fields to index
			storeFields: ['dcterms:identifier.moooi', 'dcterms:title'], // Fields to return in results
			idField: 'dcterms:identifier.moooi', // Use object identifier as ID
			searchOptions: {
				boost: FIELD_WEIGHTS, // Apply field weights
				fuzzy: FUZZY_TOLERANCE, // Fuzzy matching tolerance (0-1)
				prefix: true, // Enable prefix matching (partial words)
			},
		});

		// Add all objects to the index
		this.miniSearch.addAll(objects);

		console.info(
			`Search index built with ${objects.length} objects and ${ALL_SEARCHABLE_FIELD_NAMES.length} searchable fields`
		);
	}

	/**
	 * Search the index with optional field filtering
	 */
	search(query: string, options: SearchOptions = {}): SearchResult[] {
		// Early validation
		if (!this.miniSearch) {
			throw new Error(
				'Search index not initialized. Call buildIndex() first or check that indexReady is true before searching.'
			);
		}

		// Default options
		const { activeFields = ALL_SEARCHABLE_FIELD_NAMES, fuzzy = FUZZY_TOLERANCE, prefix = true } = options;

		// Validate options upfront
		if (typeof fuzzy === 'number' && (fuzzy < 0 || fuzzy > 1)) {
			throw new Error(`Fuzzy tolerance must be between 0 and 1, got ${fuzzy}`);
		}
		if (typeof prefix !== 'boolean') {
			throw new Error(`Prefix must be a boolean, got ${typeof prefix}`);
		}

		// Build field boost weights (only for active fields - optimized)
		const boost = Object.fromEntries(activeFields.map((field) => [field, FIELD_WEIGHTS[field]]));

		// Perform search with custom options
		const results = this.miniSearch.search(query, {
			fields: activeFields, // Only search in active fields
			boost, // Apply weights
			fuzzy, // Fuzzy matching
			prefix, // Prefix matching
			combineWith: SEARCH_COMBINE_MODE, // All terms must match (more precise results)
		});

		// Map to our SearchResult interface
		return results.map((result) => ({
			id: result.id,
			score: result.score,
			match: result.match,
		}));
	}

	/**
	 * Get object by ID from indexed objects
	 */
	getObjectById(id: string): ObjectData | undefined {
		return this.indexedObjects.find((obj) => obj['dcterms:identifier.moooi'] === id);
	}

	/**
	 * Get total number of indexed objects
	 */
	getIndexSize(): number {
		return this.indexedObjects.length;
	}

	/**
	 * Check if index is ready
	 */
	isReady(): boolean {
		return this.miniSearch !== null;
	}

	/**
	 * Clear the index
	 */
	clear(): void {
		this.miniSearch = null;
		this.indexedObjects = [];
	}
}

// Export singleton instance
export const searchService = new SearchService();
