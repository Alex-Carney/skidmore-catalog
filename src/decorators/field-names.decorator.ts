import { SetMetadata } from "@nestjs/common";

export const FieldNames = (...fields: string[]) => SetMetadata('fields', fields)
