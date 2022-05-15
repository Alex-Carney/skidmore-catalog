
/**
 * The base messages for errors from RESOURCE management calls.
 * Additional information is added at run time, as
 * per custom exceptions
 *
 * @author Alex Carney
 */
export const ResourceBusinessErrors = {
  ResourceNotFound: {
    apiErrorCode: "E_RS_001",
    errorMessage: "Resource not found",
    reason: "Resource with this name does not exist in the DB",
    advice: "Resource names are case sensitive"
  },

  ResourceAlreadyExists: {
    apiErrorCode: "E_RS_003",
    errorMessage: "A resource with this name already exists. Your resource could not be created",
    reason: "Resource names must be unique",
    advice: "If you own the existing resource, delete or modify it. Otherwise, name your resource LASTNAME_resourceName",
  },

  ResourceNotInRepository: {
    apiErrorCode: "E_RS_002",
    errorMessage: "This resource is not accessible from input repository",
    reason: "A resource must be added to a repository before it can be accessed using that repository",
    advice: "Use the API route 'update-resource-repositories' to add this resource to given repository",
    additionalInformation: '',
  },

  ResourceFieldNotFound: {
    apiErrorCode: "E_RSF_001",
    errorMessage: "Resource Field does not exist",
    reason: "The Resource supplied does not have a column/field with the input name",
    advice: "Resource field names are case sensitive. Use 'getDataModelExact' to ensure you spelled each field name correctly",
  },

  InvalidBufferSize: {
    apiErrorCode: "E_RS_003",
    errorMessage: "Invalid buffer size supplied in request",
    reason: "Buffer size either didn't exist or is out of bounds",
    advice: "Buffer size must be between 10 and 600 (inclusive). 500 is the default value",
  },

  InvalidDelimiter: {
    apiErrorCode: "E_RS_004",
    errorMessage: "Invalid delimiter supplied in request",
    reason: "Delimiter was not an allowed value",
    advice: "Delimiters supported are commas, spaces, and tabs. Use %09 for tab, %20 for space, and , (with no quotations) for comma"
  },

  InvalidInputFile: {
    apiErrorCode: "E_RS_005",
    errorMessage: "Input seed file does not match corresponding data model",
    advice: "Ensure no columns in seed file are completely empty. Manual tailoring of data model may be " +
      "required, use update-data-model route to do so"
  },

  InvalidFileType: {
    apiErrorCode: "E_RS_006",
    errorMessage: "Unsupported file type",
    advice: "Convert file to text/csv",

  }



};
