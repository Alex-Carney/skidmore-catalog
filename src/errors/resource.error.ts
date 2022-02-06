export const ResourceBusinessErrors = {
  ResourceNotFound: {
    apiErrorCode: "E_RS_001",
    errorMessage: "Resource not found",
    reason: "Resource with this name does not exist in the DB",
    advice: "Resource names are case sensitive"
  },

  ResourceNotInRepository: {
    apiErrorCode: "E_RS_002",
    errorMessage: "This resource is not accessible from input repository",
    reason: "A resource must be added to a repository before it can be accessed using that repository",
    advice: "Use the API route 'update-resource-repositories' to add this resource to given repository",
  },

  ResourceFieldNotFound: {
    apiErrorCode: "E_RSF_001",
    errorMessage: "Resource Field does not exist",
    reason: "The Resource supplied does not have a column/field with the input name",
    advice: "Resource field names are case sensitive. Use 'getDataModelExact' to ensure you spelled each field name correctly",
  }

};
