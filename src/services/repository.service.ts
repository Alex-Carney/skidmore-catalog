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
import { RepositoryPermissions } from "../constants/permission-level-constants";
import { UserCreateRepositoryDTO } from "../resolvers/user/dto/add-repositories.dto";


@Injectable()
export class RepositoryService {
  /**
   * @service An injectable service handling all operations relating to repositories. Depends on PrismaService and UserService
   *
   * @param prisma
   * @param userService
   */
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {
  }

  //----------------------------------------------------------------------------------------
  // CRUD OPERATIONS
  //----------------------------------------------------------------------------------------

  /**
   * @method This method creates a new repository with a name based on the input 'title'. The user who is supplied in the params is automatically
   * the 'owner' of this repository, which can be updated with updateRepositoryPermissions.
   * @param userId The user who is creating this repository
   * @param createRepositoryDTO data transfer object associated with this action. Check its file for more

   */
  async createRepositories(userId: string, createRepositoryDTO: UserCreateRepositoryDTO) {

    /**
     * Access the user supplied in the params, create a new repository with them with the input title. Relations will be generated automatically
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

  //----------------------------------------------------------------------------------------

  /**
   * @method Fetches repositories associated with user, along with the associated permission level
   *
   * @param userId
   * @throws NotFoundException Invalid userId
   * @returns userRepositories - repositories associated with user
   */
  async getUserRepositories(userId: string) {


    return await this.prisma.repositoriesOnUsers.findMany({
      where: {
        userId: userId
      },
      select: {
        repositoryTitle: true,
        permissionLevel: true,
      }
    })

    // try {
    //   const userRepositories = await this.prisma.user.findUnique({
    //     where: {
    //       id: user['id']
    //     },
    //     select: {
    //       repositories: {
    //         select: {
    //           repository: {
    //             select: {
    //               title: true
    //             }
    //           }
    //         }
    //       }
    //     }
    //   });
    //   return userRepositories;
    // } catch (err) {
    //   throw new NotFoundException(RepositoryBusinessErrors.UserNotFound);
    // }

  }

  //----------------------------------------------------------------------------------------


  /**
   * @method The repositories on users relation keeps track of permission level. Certain actions involving modification
   * of repositories, or the data that they contain, requires a specified permission level. Handles
   * modifications to those permission levels.
   *
   * Most of the logic in this method revolves around ensuring the requested transaction is valid.
   *
   * @param userId current user logged in making changes, aimed at another user
   * @param updateRepositoryPermissionsDTO Associated data transfer object. More information in the UpdateRepositoryPermissionsDTO file
   * @return updateResponse A body that contains the updated information
   */
  async updateRepositoryPermissions(userId: string, updateRepositoryPermissionsDTO: UpdateRepositoryPermissionsDTO): Promise<any> {

    //TODO: Logger

    /**
     * Validate input repository. We already know that userId is legitimate because that was called from the controller,
     * but we must ensure input repository is valid. NotFoundError is thrown from validateRepositoryExistence
     */
    await this.validateRepositoryExistence(updateRepositoryPermissionsDTO.repository);
    await this.validatePermissionLevelInput(updateRepositoryPermissionsDTO.targetNewPermissionLevel)

    //validate whether current permissions allow for this action to be executed - need information about requester and target
    const userToChangePerms = await this.userService.getUserFromEmail(updateRepositoryPermissionsDTO.receiverEmail);
    const permissionLevelOfTarget = await this.permissionLevelOfUserOnRepository(userToChangePerms["id"], updateRepositoryPermissionsDTO.repository);
    const permissionLevelOfRequester = await this.permissionLevelOfUserOnRepository(userId, updateRepositoryPermissionsDTO.repository);

      //edge case: owner transferring ownership, must demote current owner to admin (there can only be 1 owner)
    const ownerTransferringOwnershipEdgeCase: boolean =
      updateRepositoryPermissionsDTO.targetNewPermissionLevel == RepositoryPermissions.REPOSITORY_OWNER
      && permissionLevelOfRequester == RepositoryPermissions.REPOSITORY_OWNER;

    //handle unauthorized requests
    if (permissionLevelOfRequester < RepositoryPermissions.REPOSITORY_ADMIN
      || permissionLevelOfTarget >= permissionLevelOfRequester
      || (updateRepositoryPermissionsDTO.targetNewPermissionLevel >= permissionLevelOfRequester && !ownerTransferringOwnershipEdgeCase)) {
      throw new ForbiddenException(RepositoryBusinessErrors.RepositoryAuthorizationError);
    }

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
   * @returns message A message notifying the user that the repository was successfully deleted
   */
  async deleteRepository(userId: string, repositoryToDelete: string) {

    //verify inputs
    await this.validateRepositoryExistence(repositoryToDelete);
    await this.authenticateUserRequest(userId, repositoryToDelete, RepositoryPermissions.REPOSITORY_OWNER);

    /**
     * Unfortunately, this is another example where I've encountered a bug with prisma. Currently, deleting the parent
     * in a many-to-many relation is not supported. Therefore, we must execute
     * the SQL ourselves (the cascading delete is still handled automatically by Postgres)
     */
    try {
      await this.prisma.$executeRaw`DELETE FROM universe."Repository" WHERE title = ${repositoryToDelete}`;
      return { message: "Successfully deleted the " + repositoryToDelete + " repository" };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }

  }

  //----------------------------------------------------------------------------------------
  // OTHER FUNCTIONALITY
  //----------------------------------------------------------------------------------------

  /**
   * @private user authenticateUserRequest for outside access
   * @method Gets the relation between this repository and the user, in order to verify permission level.
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
    console.log(access);
    if (access >= requiredLevel) {
      return true;
    } else {
      const errorResponse = RepositoryBusinessErrors.RepositoryAuthorizationError;
      errorResponse.additionalInformation = "Requires access level " + requiredLevel + " of this repository. You have access level " + access;
      throw new ForbiddenException(errorResponse);
    }
  }

  //----------------------------------------------------------------------------------------

  /**
   * @method Validates that the input title refers to a repository in the DB.
   *
   * @param repositoryTitle
   * @throws NotFoundException Repository Not found
   * @returns repo The validated repository
   */
  async validateRepositoryExistence(repositoryTitle: string) {
    const repo = await this.prisma.repository.findUnique({
      where: {
        title: repositoryTitle
      }
    });
    if (!repo) {
      const errorToThrow = RepositoryBusinessErrors.RepositoryNotFound;
      errorToThrow.additionalInformation = repositoryTitle + " was an invalid repository title"
      throw new NotFoundException(errorToThrow);
    }
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
      if(permissionLevel < 0 || permissionLevel > 3 || !Number.isInteger(permissionLevel)) {
        throw new BadRequestException()
      }
  }



}
