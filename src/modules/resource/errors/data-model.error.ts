/**
 * The base messages for errors from data model calls.
 * Additional information is added at run time, as
 * per custom exceptions
 *
 * @author Alex Carney
 */
export const DataModelBusinessErrors = {
  ErrorParsingInputFile: {
    apiErrorCode: 'E_DM_001',
    errorMessage: 'An error occurred while parsing the input file',
    reason: 'Provided repository does not exist in DB.',
    additionalInformation: ''
  },

  InvalidDataTypeEncountered: {
    apiErrorCode: 'E_DM_002',
    errorMessage: 'An error occurred while processing this request',
    reason: "Provided invalid data type in data model. Data type can only be 'text' or 'numeric'"
  }






}
