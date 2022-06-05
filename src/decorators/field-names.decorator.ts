import { SetMetadata } from "@nestjs/common";

/**
 * @decorator This is an unfortunate solution to a problem I had, as it forces
 * me to violate DRY on all DTO objects.
 *
 * @see proper-body.guard.ts requires knowledge of the correct 'schema' that
 * an incoming body must have. Since TypeScript doesn't have as powerful
 * reflection capabilities (as say, Java), we can only reflect classes
 * using metadata. Therefore, we have to explicitly put the names of the
 * fields into an @FieldNames decorator for each DTO
 *
 * @param fields
 */
export const FieldNames = (...fields: string[]) => SetMetadata('fields', fields)
