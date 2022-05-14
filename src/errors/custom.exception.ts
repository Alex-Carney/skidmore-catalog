import { HttpException } from "@nestjs/common";


export class CustomException extends HttpException {
  /**
   * Base class for custom exceptions
   * @param baseMessage An object containing the error code and basic information message
   * @param additionalInformation Additional information as a string. Include error-specific information here
   * @param httpStatus From the HttpStatus enum
   * @author Alex Carney
   */
  constructor(baseMessage, additionalInformation, httpStatus) {
    super({'baseMessage': baseMessage, 'additionalInformation': additionalInformation}, httpStatus);
  }
}
