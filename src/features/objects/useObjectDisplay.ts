import { OBJECT_FIELDS } from '../../constants/objectFields';
import { MetadataField, ObjectData, ParsedMetadataSchema } from '../../types/metadata';

interface UseObjectDisplayParams {
  object: ObjectData;
  metadata: MetadataField[];
}

interface UseObjectDisplayReturn {
  title: string;
  identifier: string;
  description: string | undefined;
  identifierLabel: string;
  descriptionLabel: string;
  imageUrls: string[];
  fieldsToDisplay: MetadataField[];
}

/**
 * Extracts and organizes object data for display on detail page
 * 
 * Returns:
 * - Core fields: title, identifier, description
 * - Field labels for identifier and description
 * - Image URLs extracted from image-type fields
 * - Filtered metadata fields (excludes hero/description/empty fields)
 * 
 * @param object - The object data from API
 * @param metadata - Metadata schema definitions
 */
export function useObjectDisplay({
  object,
  metadata,
}: UseObjectDisplayParams): UseObjectDisplayReturn {
  // Parse metadata schema
  const parsedSchema = new ParsedMetadataSchema(metadata);

  // Extract core fields
  const title = object[OBJECT_FIELDS.TITLE] || 'Untitled';
  const identifier = object[OBJECT_FIELDS.IDENTIFIER] || '';
  const description = object[OBJECT_FIELDS.DESCRIPTION];

  // Get labels for core fields
  const identifierLabel = parsedSchema.getFieldLabel(OBJECT_FIELDS.IDENTIFIER, 'Identifier');
  const descriptionLabel = parsedSchema.getFieldLabel(OBJECT_FIELDS.DESCRIPTION, 'Description');

  // Get image URLs using schema method
  const imageUrls = parsedSchema.getImageUrls(object);

  // Get fields to display in metadata section using schema method
  const excludeFields = [
    OBJECT_FIELDS.TITLE,
    OBJECT_FIELDS.IDENTIFIER,
    OBJECT_FIELDS.DESCRIPTION,
  ];
  const fieldsToDisplay = parsedSchema.getDisplayFields(object, excludeFields);

  return {
    title,
    identifier,
    description,
    identifierLabel,
    descriptionLabel,
    imageUrls,
    fieldsToDisplay,
  };
}
