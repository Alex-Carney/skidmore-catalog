import { ApiProperty } from "@nestjs/swagger";
import { IsString, Validate } from "class-validator";
import { Type } from "class-transformer";
import { InputType } from "@nestjs/graphql";
import { RepositoryExists, RepositoryExistsRule } from "../../../validation/repository-exists.rule";
//This is the scaffold for the Swagger UI POST body for removing roles
export class DeleteRepositoryDTO {
    @ApiProperty({
        description: "Title of role to delete",
    })
    @IsString()
    repository: string
}
