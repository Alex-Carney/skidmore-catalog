import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateRepositoryPermissionsDTO } from "src/resolvers/user/dto/update-admin.dto";
import { UserService } from "./user.service";
import { RepositoryBusinessErrors } from "../errors/repository.error";
import { RepositoryPermissions } from "../resolvers/user/dto/permission-level-constants";

@Injectable()
export class RepositoryService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {
  }


  /**
   * @method This method creates a new repository with a name based on the input 'title'. The user who is supplied in the params is automatically
   * the 'owner' of this repository, which can be updated with updateRepositoryPermissions.
   * @param userId The user who is creating this repository
   * @param repositoriesToCreate the names of repositories to be created

   */
  async createRepositories(userId: string, repositoriesToCreate: string[]) {

    /**
     * Access the user supplied in the params, create a new repository with them with the input title. Relations will be generated automatically
     */
    const createArguments = repositoriesToCreate.map((title) => {
        return {
          repository: {
            create: {
              title: title
            }
          },
          permissionLevel: RepositoryPermissions.REPOSITORY_OWNER
        };
      });

    try {
      /**
       * A small quirk I don't understand, returning update data directly (inlining this statement) does not throw the
       * error properly.
       */
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          repositories: {
            create: createArguments
          }
        }
      });
      return createArguments;
    } catch (err) {
      //TODO: Logger error
      throw new BadRequestException(RepositoryBusinessErrors.RepositoryAlreadyExists);
    }


  }

  async getUserRepositories(userId: string) {
    try {
      const userRepositories = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          repositories: {
            select: {
              repository: {
                select: {
                  title: true
                }
              }
            }
          }
        }
      });
      return userRepositories;
    } catch (err) {
      throw new NotFoundException(RepositoryBusinessErrors.UserNotFound);
    }

  }


  /**
   * @method The repositories on users relation keeps track of permission level. Certain actions involving modification
   * of repositories, or the data that they contain, requires a specified permission level. This service handles
   * modifications to those permission levels.
   *
   * Most of the logic in this method revolves around ensuring the requested transaction is valid.
   *
   * @param userId current user logged in making changes, aimed at another user
   * @param updateRepositoryPermissionsDTO more information in the UpdateRepositoryPermissionsDTO file
   * @return updateResponse A body that contains the updated information
   */
  async updateRepositoryPermissions(userId: string, updateRepositoryPermissionsDTO: UpdateRepositoryPermissionsDTO): Promise<any> {

    //TODO: Logger

    /**
     * Validate input repository. We already know that userId is legitimate because that was called from the controller,
     * but we must ensure input repository is valid. NotFoundError is thrown from validateRepositoryExistence
     */
    await this.validateRepositoryExistence(updateRepositoryPermissionsDTO.repository);


    //validate whether current permissions allow for this action to be executed
    const userToChangePerms = await this.userService.getUserIdFromEmail(updateRepositoryPermissionsDTO.receiverEmail);
    const permissionLevelOfRecipient = await this.permissionLevelOfUserOnRepository(userToChangePerms["id"], updateRepositoryPermissionsDTO.repository);
    const permissionLevelOfRequester = await this.permissionLevelOfUserOnRepository(userId, updateRepositoryPermissionsDTO.repository);

      //edge case: owner transferring ownership, must demote current owner to admin (there can only be 1 owner)
    const ownerTransferringOwnershipEdgeCase: boolean =
      updateRepositoryPermissionsDTO.permissionLevel == RepositoryPermissions.REPOSITORY_OWNER && permissionLevelOfRequester == RepositoryPermissions.REPOSITORY_OWNER;

    //handle unauthorized requests
    if (permissionLevelOfRequester < RepositoryPermissions.REPOSITORY_ADMIN
      || permissionLevelOfRecipient >= permissionLevelOfRequester
      || (updateRepositoryPermissionsDTO.permissionLevel >= permissionLevelOfRequester && !ownerTransferringOwnershipEdgeCase)) {
      throw new ForbiddenException(RepositoryBusinessErrors.RepositoryAuthorizationError);
    }

    //update database record accordingly
    const updateResponse = await this.prisma.repositoriesOnUsers.update({
      where: {
        repositoryTitle_userId: {
          userId: userToChangePerms["id"],
          repositoryTitle: updateRepositoryPermissionsDTO.repository
        }
      },
      data: {
        permissionLevel: updateRepositoryPermissionsDTO.permissionLevel
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
          permissionLevel: RepositoryPermissions.REPOSITORY_ADMIN
        }
      });
    } else {
      return updateResponse;
    }
  }

  async permissionLevelOfUserOnRepository(userId: string, repositoryTitle: string): Promise<number> {
    //Get the relation between this repository and the user, verify access level
    /**
     * Level 0: No access
     * Level 1: User of the repository. Read privileges of repository resources
     * Level 2: Admin of the repository. Read, write, delete privileges of repository resources. Can add new possessors to the repository
     * Level 3: Owner of this repository. Can add new admins to the repository, and can delete the repository
     */

    /**
     * NOTE: Do not call this function if the repository does not exist. Otherwise, a nonsense entry will be in the DB
     */
    let permissionResponse = await this.prisma.repositoriesOnUsers.findUnique({
      where: {
        repositoryTitle_userId: {
          userId: userId,
          repositoryTitle: repositoryTitle }
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
          repositoryTitle: repositoryTitle, //MUST EXIST
          permissionLevel: RepositoryPermissions.REPOSITORY_NO_ACCESS
        }
      });
    }
    return permissionResponse["permissionLevel"];

  }

  async deleteRepository(userId: string, repositoryToDelete: string) {

    //Step 0: Verify that the repository exists
    await this.validateRepositoryExistence(repositoryToDelete);

    //step 1: Verify that a current admin of this repository is the one doing the operation
    await this.authenticateUserRequest(userId, repositoryToDelete, 3); //owners only

    /**
     * Unfortunately, this is another example where I've encountered a bug with prisma. Currently, deleting the parent
     * in a many-to-many relation is not supported, even though the code above should work. Therefore, we must execute
     * the SQL ourselves (the cascading delete is still handled automatically)
     */
    try {
      await this.prisma.$executeRaw`DELETE FROM universe."Repository" WHERE title = ${repositoryToDelete}`;
      return { message: "Successfully deleted the " + repositoryToDelete + " repository" };
    } catch (err) {
      throw new InternalServerErrorException();
    }

  }

  // userIdFromEmail(userEmail: string): Promise<{id: string}> {
  //     return this.prisma.user.findUnique({
  //         where: {
  //           email: userEmail,
  //         },
  //         select: {
  //             id: true,
  //         }
  //     })
  // }

  async authenticateUserRequest(userId: string, repository: string, requiredLevel: number): Promise<boolean> {
    const access = await this.permissionLevelOfUserOnRepository(userId, repository);
    if (access["permissionLevel"] >= requiredLevel) {
      return true;
    } else {
      const errorResponse = RepositoryBusinessErrors.RepositoryAuthorizationError;
      errorResponse.additionalInformation = "Requires access level " + requiredLevel + " of this repository. You have access level " + access["permissionLevel"];
      throw new ForbiddenException(errorResponse);
    }
  }

  async validateRepositoryExistence(repositoryTitle: string) {
    const repo = await this.prisma.repository.findUnique({
      where: {
        title: repositoryTitle
      }
    });
    if (!repo) {
      throw new NotFoundException(RepositoryBusinessErrors.RepositoryNotFound);
    }
  }


}
