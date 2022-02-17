import { HttpException } from "@nestjs/common";

export class CustomException extends HttpException {
  constructor(baseMessage, additionalInformation, httpStatus) {
    super({'baseMessage': baseMessage, 'additionalInformation': additionalInformation}, httpStatus);
  }
}
