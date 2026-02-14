/**
 * Type definitions for metadata schema and object data
 */

/**
 * Represents a single field definition from the Mappings sheet
 */
export interface MetadataField {
	/** The field name (e.g., "moo:workingNotes", "dcterms:Collection") */
	field: string;

	/** The namespace/standard (e.g., "Dublin Core", "Darwin Core", "Museum of Objects of Interest") */
	namespace: string;

	/** Human-readable label for display */
	label: string;

	/** Comma-separated list of collection names this field applies to (e.g., "Core, Library", "All") */
	applicableCollections: string;

	/** Whether field is required for MVP completeness: "Mandatory", "Optional", or "For future development" */
	required: string;

	/** Description of the field's purpose */
	purpose: string;

	/** Field type and control hints (e.g., "Free text", "ISO8601 compliant date", "Image") */
	fieldTypeAndControls: string;

	/** Example value(s) for developer reference only - not used in application logic */
	example: string;
}

/**
 * Collection of all metadata field definitions
 */
export type MetadataSchema = MetadataField[];

/**
 * Represents a single object from the Museum sheet
 * Uses an index signature to allow dynamic fields based on metadata schema
 */
export interface ObjectData {
	/** Dynamic fields from the metadata schema */
	[fieldName: string]: string | undefined;
}

/**
 * Helper type to extract specific well-known fields with type safety
 */
export interface ObjectDataTyped extends ObjectData {
	/** Object identifier (mandatory) */
	'dcterms:identifier.moooi': string;

	/** Object title (mandatory) */
	'dcterms:title': string;

	/** Object description (mandatory) */
	'dcterms:description': string;

	/** Collection name (mandatory) */
	'dcterms:Collection': string;

	/** Date accessioned (mandatory) */
	'dcterms:dateAccepted': string;

	/** Photograph/image (optional) */
	'dcterms:image'?: string;
}

/**
 * Response from Google Sheets API
 */
export interface SheetsApiResponse {
	range: string;
	majorDimension: 'ROWS' | 'COLUMNS';
	values: string[][];
}

/**
 * Parsed metadata schema with helper methods
 */
export class ParsedMetadataSchema {
	private fields: Map<string, MetadataField>;

	private fieldsByLabel: Map<string, MetadataField>;

	constructor(public schema: MetadataSchema) {
		this.fields = new Map(schema.map((field) => [field.field, field]));
		this.fieldsByLabel = new Map(schema.map((field) => [field.label, field]));
	}

	/**
	 * Get field definition by field name
	 */
	getField(fieldName: string): MetadataField | undefined {
		return this.fields.get(fieldName);
	}

	/**
	 * Get field definition by label
	 */
	getFieldByLabel(label: string): MetadataField | undefined {
		return this.fieldsByLabel.get(label);
	}

	/**
	 * Get all field names in the order they appear in the schema
	 */
	getAllFieldNames(): string[] {
		return this.schema.map((field) => field.field);
	}

	/**
	 * Get all mandatory fields (required for MVP completeness)
	 */
	getMandatoryFields(): MetadataField[] {
		return this.schema.filter((field) => field.required.startsWith('Mandatory'));
	}

	/**
	 * Get all image fields (identified by "Image" in fieldTypeAndControls)
	 */
	getImageFields(): MetadataField[] {
		return this.schema.filter((field) => field.fieldTypeAndControls === 'Image');
	}

	/**
	 * Check if a field is mandatory for MVP completeness
	 */
	isMandatory(fieldName: string): boolean {
		const field = this.getField(fieldName);
		return field?.required.startsWith('Mandatory') ?? false;
	}

	/**
	 * Check if a field contains image URLs
	 */
	isImageField(fieldName: string): boolean {
		const field = this.getField(fieldName);
		return field?.fieldTypeAndControls === 'Image';
	}

	/**
	 * Get applicable collections as an array
	 */
	getApplicableCollections(fieldName: string): string[] {
		const field = this.getField(fieldName);
		if (!field) return [];

		return field.applicableCollections
			.split(',')
			.map((c) => c.trim())
			.filter((c) => c.length > 0);
	}

	/**
	 * Get image URLs from an object based on image-type fields
	 */
	getImageUrls(object: ObjectData): string[] {
		const imageFields = this.getImageFields();
		return imageFields.map((field) => object[field.field]).filter((url): url is string => !!url && url.trim() !== '');
	}

	/**
	 * Get fields to display in metadata section
	 * Excludes hero fields (title, identifier), description, and empty fields
	 */
	getDisplayFields(object: ObjectData, excludeFields: string[]): MetadataField[] {
		return this.schema.filter((field) => {
			// Skip excluded fields
			if (excludeFields.includes(field.field)) {
				return false;
			}
			// Skip empty fields
			const value = object[field.field];
			if (!value || value.trim() === '') {
				return false;
			}
			return true;
		});
	}

	/**
	 * Get label for a field, with fallback
	 */
	getFieldLabel(fieldName: string, fallback: string): string {
		return this.getField(fieldName)?.label || fallback;
	}
}
