import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { compareIgnoreOrder } from "../utils/array-equals.util";
import { InvalidBodyErrors } from "../errors/invalid-body.error";
import { CustomException } from "../errors/custom.exception";


/**
 * This guard can be used to decorate controller routes with
 * @UseGuards(ProperBodyGuard) and @ProperBody(dto), which
 * validates that the user supplied a proper body with their request.
 *
 * This guard solves a major issue: Users may accidentally forget to include
 * a body with their POST request, or mis-type their input (repositories:, instead
 * of repository:)
 *
 * Before this guard, any mistakes in the body would return an internal server error,
 * and the user would have no idea what they did wrong
 *
 * @see proper-body.decorator.ts
 */
@Injectable()
export class ProperBodyGuard implements CanActivate {
  private readonly logger = new Logger(ProperBodyGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.log("Proper body GUARD executed")

    // This data is retrieved from @ProperBody(dto). Returns a class object
    const properDto = this.reflector.get<any>('routeDto', context.getHandler())

    const request = context.switchToHttp().getRequest()

    //User's body
    const incomingBodyKeys = Object.keys(request.body)

    //Required body
    const requiredBodyKeys = this.reflector.get<string[]>('fields', properDto)

    if(!compareIgnoreOrder(incomingBodyKeys, requiredBodyKeys)) {

      this.logger.warn("USER BODY KEYS DO NOT MATCH REQUIRED BODY KEYS")
      this.logger.log("INCOMING " + incomingBodyKeys)
      this.logger.log("REQUIRED " + requiredBodyKeys)
      throw new CustomException(InvalidBodyErrors.InvalidBody,
        "Required body keys are: " + requiredBodyKeys + ". Your incorrect keys were: " + incomingBodyKeys,
        HttpStatus.BAD_REQUEST)
    }
    return true
  }
}
