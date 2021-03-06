import { RepositoryPermissions } from "../constants/permission-level-constants";
import { CustomException } from "../../../errors/custom.exception";
import { RepositoryBusinessErrors } from "../errors/repository.error";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/services/prisma.service";

@Injectable()
export class RepositoryValidation {

  private readonly logger = new Logger(RepositoryValidation.name);

  /**
   * RepositoryValidation is an injectable service that can be used by other modules to determine whether certain
   * actions are valid or not, such as an un-authorized user trying to access someone else's repository, or a user
   * inputting an invalid repository into their API call.
   * @param prisma dependency
   * @author Alex Carney
   */
  constructor(
    private prisma: PrismaService,
  ) {
  }

  /**
   * @private use authenticateUserRequest for outside access
   * @method Gets the relation between this repository and the repository, in order to verify permission level.
   *
   * NOTE: Do not call this method if the repository does not exist. This can be verified with
   * this.validateRepositoryExistence
   *
   * Mappings between access level numbers, and the roles they convert to are in constants/permission-level-constants
   *
   * Level 0: No access
   * Level 1: User of the repository. Read privileges of repository resources
   * Level 2: Admin of the repository. Read, write, delete privileges of repository resources. Can add new possessors to the repository
   * Level 3: Owner of this repository. Can add new admins to the repository, and can delete the repository
   *
   * @param userId
   * @param repositoryTitle
   * @returns permissionResponse An object with a 'permission level' field
   */
  private async permissionLevelOfUserOnRepository(userId: string, repositoryTitle: string): Promise<number> {
    let permissionResponse = await this.prisma.repositoriesOnUsers.findUnique({
      where: {
        repositoryTitle_userId: {
          userId: userId,
          repositoryTitle: repositoryTitle
        }
      },
      select: {
        permissionLevel: true
      }
    });

    if (!permissionResponse) {
      //relation does not exist yet, create it, and return it
      permissionResponse = await this.prisma.repositoriesOnUsers.create({
        data: {
          userId: userId,
          repositoryTitle: repositoryTitle,
          permissionLevel: RepositoryPermissions.REPOSITORY_NO_ACCESS
        }
      });
    }
    return permissionResponse["permissionLevel"];

  }

  //----------------------------------------------------------------------------------------

  /**
   * @method Public version for authenticating repository actions.
   *
   * @param userId
   * @param repositoryTitle
   * @param requiredLevel of the form RepositoryPermissions.VALUE
   * @throws ForbiddenException Unauthorized action
   * @returns true or exception
   */
  async authenticateUserRequest(userId: string, repositoryTitle: string, requiredLevel: number): Promise<boolean> {
    const access = await this.permissionLevelOfUserOnRepository(userId, repositoryTitle);
    this.logger.log(access);
    if (access >= requiredLevel) {
      this.logger.log("Validated user request on the basis that " + userId + " has an access level " + access + " greater than required level of " + requiredLevel);
      return true;
    } else {
      throw new CustomException(RepositoryBusinessErrors.RepositoryAuthorizationError,
        "Requires access level " + requiredLevel + " of this repository (" + repositoryTitle + "). You have access level " + access,
        HttpStatus.FORBIDDEN);
    }

  }

  //----------------------------------------------------------------------------------------

  /**
   * @method Validates that the input title refers to a repository in the DB.
   *
   * @param repositoryTitle
   * @returns repo The validated repository
   */
  async validateRepositoryExistence(repositoryTitle: string) {
    return await this.prisma.repository.findUnique({
      where: {
        title: repositoryTitle
      }
    });
  }


  /**
   * @method Validates that repository exists, throws an error if not
   * @param repositoryTitle
   * @throws NotFoundException
   */
  async validateRepositoryExistenceError(repositoryTitle: string) {
    const repo = await this.prisma.repository.findUnique({
      where: {
        title: repositoryTitle
      }
    });
    if (!repo) {
      throw new CustomException(RepositoryBusinessErrors.RepositoryNotFound,
        repositoryTitle + " was an invalid repository title",
        HttpStatus.NOT_FOUND);
    }
    this.logger.log("Invalidated repository title " + repositoryTitle + " since it does NOT EXIST (validateRepositoryExistenceError)");
  }

  //----------------------------------------------------------------------------------------


  /**
   * @method ensures that there does not already exist a repository with this name
   * @param repositoryTitle
   * @throws RepositoryAlreadyExists
   */
  async validateRepositoryNameDoesNotAlreadyExist(repositoryTitle: string) {
    const repo = await this.prisma.repository.findUnique({
      where: {
        title: repositoryTitle
      }
    });
    if (repo) {
      throw new CustomException(RepositoryBusinessErrors.RepositoryAlreadyExists,
        "A repository with the name " + repositoryTitle + " already exists",
        HttpStatus.BAD_REQUEST);
    }
    this.logger.log("Validated that " + repositoryTitle + " does NOT already exist");
    return repo;
  }

  //----------------------------------------------------------------------------------------

  /**
   * @method Throws an exception if the input permission level is outside the allowed range [0 3] or a non-integer
   *
   * @param permissionLevel
   * @throws BadRequestException
   */
  async validatePermissionLevelInput(permissionLevel: number) {

    //In case the user input the permission level as a string accidentally
    permissionLevel = Number(permissionLevel)

    if (permissionLevel < 0 || permissionLevel > 3 || !Number.isInteger(permissionLevel) || Number.isNaN(permissionLevel)) {
      throw new CustomException(RepositoryBusinessErrors.InvalidPermissionLevel,
        "Can't have a permission level of " + permissionLevel,
        HttpStatus.BAD_REQUEST);
    }
    this.logger.log("Validated that " + permissionLevel + " is a valid permission level");
  }


}




