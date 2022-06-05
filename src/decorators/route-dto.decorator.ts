import { SetMetadata } from "@nestjs/common";

/**
 * @decorator Used to tag controller endpoints with the DTO for the body
 * to the controller. This allows the body guard to compare incoming keys
 * to the required body keys.
 * @see proper-body.guard.ts
 * @param routeDto The class name of the body DTO
 */
export const BodyDto = (routeDto: any) => SetMetadata('routeDto', routeDto)
