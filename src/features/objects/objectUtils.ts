import { OBJECT_FIELDS } from '../../constants/objectFields';
import type { MetadataField, ObjectData, ParsedMetadataSchema } from '../../types/metadata';

/**
 * Get fields to display in metadata section
 * Excludes hero fields (title, identifier), description, and empty fields
 */
export function getFieldsToDisplay(parsedSchema: ParsedMetadataSchema | null, object: ObjectData): MetadataField[] {
	if (!parsedSchema) {
		return [];
	}

	return parsedSchema.schema.filter((field) => {
		// Skip hero section fields
		if (field.field === OBJECT_FIELDS.TITLE || field.field === OBJECT_FIELDS.IDENTIFIER) {
			return false;
		}
		// Skip description (shown separately)
		if (field.field === OBJECT_FIELDS.DESCRIPTION) {
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
