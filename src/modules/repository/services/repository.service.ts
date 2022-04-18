import { HttpStatus, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/services/prisma.service";
import { UpdateRepositoryPermissionsDTO } from "src/modules/repository/dto/update-permissions.dto";
import { UserService } from "../../../services/user.service";
import { RepositoryBusinessErrors } from "../errors/repository.error";
import { RepositoryPermissions } from "../constants/permission-level-constants";
import { UserCreateRepositoryDTO } from "../dto/add-repositories.dto";
import { CustomException } from "../../../errors/custom.exception";
import { RepositoryValidation } from "../validation/repository.validation";


@Injectable()
export class RepositoryService {
  /**
   * @service An injectable service handling all operations relating to repositories. Depends on PrismaService and UserService
   *
   * @param prisma
   * @param userService
   * @param repositoryValidation
   */
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private repositoryValidation: RepositoryValidation
  ) {
  }

  private readonly logger = new Logger(RepositoryService.name);

  //----------------------------------------------------------------------------------------
  // CRUD OPERATIONS
  //----------------------------------------------------------------------------------------

  /**
   * @method This method creates a new repository with a name based on the input 'title'. The repository who is supplied in the params is automatically
   * the 'owner' of this repository, which can be updated with updateRepositoryPermissions.
   * @param userId The repository who is creating this repository
   * @param createRepositoryDTO data transfer object associated with this action. Check its file for more

   */
  public async createRepositories(userId: string, createRepositoryDTO: UserCreateRepositoryDTO) {

    for (const repository of createRepositoryDTO.repositories) {
      await this.repositoryValidation.validateRepositoryNameDoesNotAlreadyExist(repository);
      this.logger.log("Successfully validated repository " + repository);
    }

    /**
     * Access the repository supplied in the params, create a new repository with them with the input title. Relations will be generated automatically
     */
    const createArguments = createRepositoryDTO.repositories.map((title) => {
      return {
        repository: {
          create: {
            title: title
          }
        },
        permissionLevel: RepositoryPermissions.REPOSITORY_OWNER
      };
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        repositories: {
          create: createArguments
        }
      }
    });
    this.logger.log("updated user " + userId + " with new repositories");
    return createArguments;
  }

  //----------------------------------------------------------------------------------------

  /**
   * @method Fetches repositories associated with repository, along with the associated permission level
   *
   * @param userId
   * @throws NotFoundException Invalid userId
   * @returns userRepositories - repositories associated with repository
   */
  async getUserRepositories(userId: string) {
    return await this.prisma.repositoriesOnUsers.findMany({
      where: {
        userId: userId
      },
      select: {
        repositoryTitle: true,
        permissionLevel: true
      }
    });

  }

  //----------------------------------------------------------------------------------------

  async getRepositoryByName(repositoryTitle: string) {
    return await this.prisma.repository.findUnique({
      where: {
        title: repositoryTitle
      }
    });
  }


  /**
   * @method The repositories on users relation keeps track of permission level. Certain actions involving modification
   * of repositories, or the data that they contain, requires a specified permission level. Handles
   * modifications to those permission levels.
   *
   * Most of the logic in this method revolves around ensuring the requested transaction is valid.
   *
   * @param userId current repository logged in making changes, aimed at another repository
   * @param updateRepositoryPermissionsDTO Associated data transfer object. More information in the UpdateRepositoryPermissionsDTO file
   * @return updateResponse A body that contains the updated information
   */
  async updateRepositoryPermissions(userId: string, updateRepositoryPermissionsDTO: UpdateRepositoryPermissionsDTO): Promise<any> {

    /**
     * Validate input repository. We already know that userId is legitimate because that was called from the controller,
     * but we must ensure input repository is valid. NotFoundError is thrown from validateRepositoryExistence
     */
    // await this.validateRepositoryExistence(updateRepositoryPermissionsDTO.repository);
    await this.repositoryValidation.validatePermissionLevelInput(updateRepositoryPermissionsDTO.targetNewPermissionLevel);

    //validate whether current permissions allow for this action to be executed - need information about requester and target
    const userToChangePerms = await this.userService.getUserFromEmail(updateRepositoryPermissionsDTO.receiverEmail);
    const permissionLevelOfTarget = await this.permissionLevelOfUserOnRepository(userToChangePerms["id"], updateRepositoryPermissionsDTO.repository);
    const permissionLevelOfRequester = await this.permissionLevelOfUserOnRepository(userId, updateRepositoryPermissionsDTO.repository);


    //edge case: owner transferring ownership, must demote current owner to admin (there can only be 1 owner)
    const ownerTransferringOwnershipEdgeCase: boolean =
      updateRepositoryPermissionsDTO.targetNewPermissionLevel == RepositoryPermissions.REPOSITORY_OWNER
      && permissionLevelOfRequester == RepositoryPermissions.REPOSITORY_OWNER;

    if (ownerTransferringOwnershipEdgeCase) {
      this.logger.warn("User " + userId +
        " transferred ownership of repository " +
        updateRepositoryPermissionsDTO.repository + " to " +
        updateRepositoryPermissionsDTO.receiverEmail);
    }

    //handle unauthorized requests
    if (permissionLevelOfRequester < RepositoryPermissions.REPOSITORY_ADMIN
      || permissionLevelOfTarget >= permissionLevelOfRequester
      || (updateRepositoryPermissionsDTO.targetNewPermissionLevel >= permissionLevelOfRequester && !ownerTransferringOwnershipEdgeCase)) {

      throw new CustomException(
        RepositoryBusinessErrors.RepositoryAuthorizationError,
        "Your permission level is " + permissionLevelOfRequester + " compared to target's: " + permissionLevelOfTarget,
        HttpStatus.FORBIDDEN);
    }

    this.logger.log("An update permissions request with permission level of target " + permissionLevelOfTarget + " and permission level of requester " + permissionLevelOfRequester + " passed");

    //call is valid, update database record accordingly
    const updateResponse = await this.prisma.repositoriesOnUsers.update({
      where: {
        repositoryTitle_userId: {
          userId: userToChangePerms["id"],
          repositoryTitle: updateRepositoryPermissionsDTO.repository
        }
      },
      data: {
        permissionLevel: updateRepositoryPermissionsDTO.targetNewPermissionLevel
      }
    });

    //handle owner changing owner edge case, must demote current owner
    if (ownerTransferringOwnershipEdgeCase) {
      return await this.prisma.repositoriesOnUsers.update({
        where: {
          repositoryTitle_userId: {
            userId: userId,
            repositoryTitle: updateRepositoryPermissionsDTO.repository
          }
        },
        data: {
          permissionLevel: RepositoryPermissions.REPOSITORY_ADMIN //old owner becomes admin
        }
      });
    } else {
      return updateResponse;
    }
  }

  //----------------------------------------------------------------------------------------

  /**
   * @method Deletes a repository record, along with all dependent records, from the DB
   *
   * @param userId
   * @param repositoryToDelete
   * @throws InternalServerErrorException if raw SQL is unable to execute
   * @returns message A message notifying the repository that the repository was successfully deleted
   */
  async deleteRepository(userId: string, repositoryToDelete: string) {

    /**
     * Unfortunately, this is another example where I've encountered a bug with prisma. Currently, deleting the parent
     * in a many-to-many relation is not supported. Therefore, we must execute
     * the SQL ourselves (the cascading delete is still handled automatically by Postgres)
     */
    try {
      await this.prisma.$executeRaw`DELETE FROM universe."Repository" WHERE title = ${repositoryToDelete}`;
      this.logger.warn("Repository deleted" + repositoryToDelete + " by user " + userId);
      return { message: "Successfully deleted the " + repositoryToDelete + " repository" };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }

  }

  //----------------------------------------------------------------------------------------
  // OTHER FUNCTIONALITY
  //----------------------------------------------------------------------------------------

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

    console.log(permissionResponse);

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
}
