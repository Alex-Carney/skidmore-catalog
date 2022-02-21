import { HttpStatus, Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { RepositoryService } from "../services/repository.service";
import { CustomException } from "../errors/custom.exception";
import { RepositoryBusinessErrors } from "../errors/repository.error";
import { RepositoryValidation } from "./repository.validation";
import { PrismaService } from "../prisma/prisma.service";

@ValidatorConstraint({name: 'RepositoryExists', async: true})
@Injectable()
export class RepositoryExistsRule implements ValidatorConstraintInterface {
  constructor(private repositoryService: RepositoryService) {}

  async validate(repositoryTitle: string) {
    let repo;
    try {
      repo = await this.repositoryService.getRepositoryByName(repositoryTitle)
    } catch(e) {
      return false
    }
    if (!repo) {
      throw new CustomException(RepositoryBusinessErrors.RepositoryNotFound,
        repositoryTitle + " was an invalid repository title",
        HttpStatus.NOT_FOUND);
    }
    return true

  }
}
