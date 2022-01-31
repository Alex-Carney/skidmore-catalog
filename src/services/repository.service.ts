import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, Role, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateRoleAdminDTO } from "src/resolvers/user/dto/update-admin.dto";
import { UserService } from "./user.service";
import { RepositoryBusinessErrors } from "../errors/repository.error";
import { UserBusinessErrors } from "../errors/user.error";

@Injectable()
export class RepositoryService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {
  }


  /**
   * @method This method creates a new role with a name based on the input 'title'. The user who is supplied in the params is automatically
   * the 'admin' of this resource, which can be updated with updateRoleAdmin. Additionally, the user is automatically added as one of the
   * "owners" of this newly created role
   * @param userId The user who is creating this role
   * @param titles

   */
  async upsertRoles(userId: string, titles: string[]): Promise<User> {

    /**
     * Access the user supplied in the params, create a new role with them with the input title. Relations will be generated automatically
     */

      //this means it can work for an input array of roles
    const createArguments = titles.map(title => {
        return {
          role: {
            create: {
              title: title
            }
          },
          permissionLevel: 3
        };
      });

    try {
      /**
       * A small quirk I don't understand, returning update data directly (inlining this statement) does not throw the
       * error properly.
       */
      const dbUpdateData = await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            create: createArguments
          }
        }
      });
      return dbUpdateData;
    } catch (err) {
      //TODO: Logger error
      throw new BadRequestException(RepositoryBusinessErrors.RepositoryAlreadyExists);
    }


    /**TODO: Error handling if you try to add a role that already exists ("you must contact an admin of this role to gain access, if you're trying
     to create a new role choose a different name") **/

  }

  async getUserRoles(userId: string) {
    try {
      const userRepositories = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        //   include: {
        //       roles: true,
        //       rolesAdminOf: true
        //   },
        select: {
          roles: {
            select: {
              role: {
                select: {
                  title: true
                }
              }
            }
          }
          //roles: true,
        }
      });
      return userRepositories;
    } catch (err) {
      throw new NotFoundException(RepositoryBusinessErrors.UserNotFound);
    }

  }


  /**
   * @method Each role has multiple administrators. Only a role admin can change administration priviledges, and grant read/write access of resources
   * under that role to another user. By default, the creator of the role is the first admin, who can then add more using this endpoint (which uses
   * this service)
   *
   * @param userId current admin logged in making changes
   * @param updateRoleAdminDto
   */
  async updateRoleAdmins(userId: string, updateRoleAdminDto: UpdateRoleAdminDTO): Promise<any> {

    console.log(updateRoleAdminDto.receiverEmail);

    /**
     *Step 0: Validate request. We already know that userId is legitimate because that was called from the controller,
     * but we must ensure input repository is valid
     *
     * We will validate the existence of the recipient user in Step 1
     */
    await this.validateRepositoryExistence(updateRoleAdminDto.repository);

    /** Step 1: Determine if the user has the necessary permission level themselves to perform this action
     * If the request is attempting to make a user into an admin or the new owner, permission level 3 is required
     * Otherwise, if this request is attempting to demote another user, we must ensure that the demoted user has a
     * lower access level than the requester.
     */

      //we need to know both the access level of the requesting user, and the user being acted upon
      //get recipient user and their access level:
    const userToChangePerms = await this.userService.userIdFromEmail(updateRoleAdminDto.receiverEmail);
    const accessObjOfRecipient = await this.accessLevel(userToChangePerms["id"], updateRoleAdminDto.repository);
    const accessObjOfRequester = await this.accessLevel(userId, updateRoleAdminDto.repository);

    /**
     * If the requester has access level less than or equal to 1 (read/write only), stop
     * If the recipient has a higher permission level than the requester, stop
     * If the requester is trying to promote the recipient to a equal or higher permission level, stop (unless it is an owner transferring ownership)
     */
    const ownerTransferringOwnershipEdgeCase: boolean = updateRoleAdminDto.permissionLevel == 3 && accessObjOfRequester["permissionLevel"] == 3;
    if(accessObjOfRequester["permissionLevel"] < 2
      || accessObjOfRecipient["permissionLevel"] >= accessObjOfRequester["permissionLevel"]
      || (updateRoleAdminDto.permissionLevel >= accessObjOfRequester["permissionLevel"] && !ownerTransferringOwnershipEdgeCase)){
      throw new ForbiddenException(RepositoryBusinessErrors.RepositoryAuthorizationError)
    }

    const updateResponse = await this.prisma.rolesOnUsers.update({
      where: {
        roleTitle_userId: {
          userId: userToChangePerms["id"],
          roleTitle: updateRoleAdminDto.repository //we know this repository exists at this point because of accessLevel call
        }
      },
      data: {
        permissionLevel: updateRoleAdminDto.permissionLevel,
      }
    })


    /**
     * Edge case: Owner transferring ownership, must demote current owner to admin (there can only be 1 owner)
     */
    if(ownerTransferringOwnershipEdgeCase) {
      await this.prisma.rolesOnUsers.update({
        where: {
          roleTitle_userId: {
            userId: userId,
            roleTitle: updateRoleAdminDto.repository,
          }
        },
        data: {
          permissionLevel: 2, //old owner becomes an admin
        }
      })
    }

      return updateResponse;

  }

  async accessLevel(userId: string, roleTitle: string): Promise<{ permissionLevel: number }> {
    //Get the relation between this role and the user, verify access level
    /**
     * Level 0: No access
     * Level 1: Tenent/Possessor of the role. Read priviledges of role resources
     * Level 2: Admin of the role. Read, write, delete priviledges of role resources. Can add new tenents/possessors to the role
     * Level 3: Owner of this role. Can add new admins to the role, and can delete the role
     */

    /**
     * NOTE: Do not call this function if the repository does not exist. Otherwise, a nonsense entry will be in the DB
     */


    let accessResponse = await this.prisma.rolesOnUsers.findUnique({
      where: {
        roleTitle_userId: { userId: userId, roleTitle: roleTitle }
      },
      select: {
        permissionLevel: true
      }
    });
    console.log(accessResponse);
    if (!accessResponse) {
      //relation does not exist yet, create it, and return it
      accessResponse = await this.prisma.rolesOnUsers.create({
        data: {
          userId: userId,
          roleTitle: roleTitle, //MUST EXIST
          permissionLevel: 0,
        }
      })
    }
    return accessResponse;

  }

  async deleteRole(userId: string, roleToDelete: string) {

    //step 1: Verify that a current admin of this role is the one doing the operation
    await this.authenticateUserRequest(userId, roleToDelete, 3); //owners only
    //step 2: do the transaction
    // return this.prisma.role.delete({
    //     where: {
    //         title: roleToDelete,
    //     }
    // })

    /**
     * Unfortunately, this is another example where I've encountered a bug with prisma. Currently, deleting the parent
     * in a many-to-many relation is not supported, even though the code above should work. Therefore, we must execute
     * the SQL ourselves (the cascading delete is still handled automatically)
     */
    try {
      await this.prisma.$executeRaw`DELETE FROM universe."Role" WHERE title = ${roleToDelete}`;
      return { message: "Successfully deleted the " + roleToDelete + " repository" };
    } catch (err) {
      throw new NotFoundException(RepositoryBusinessErrors.RepositoryNotFound);
    }

    //await this.prisma.$executeRaw('DELETE FROM $1 WHERE title = $2', 'universe."Role"', roleToDelete)
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
    const access = await this.accessLevel(userId, repository);
    if (access["permissionLevel"] >= requiredLevel) {
      return true;
    } else {
      const errorResponse = RepositoryBusinessErrors.RepositoryAuthorizationError;
      errorResponse.additionalInformation = "Requires access level " + requiredLevel + " of this repository. You have access level " + access["permissionLevel"];
      throw new ForbiddenException(errorResponse);
    }
  }

  async validateRepositoryExistence(repositoryTitle: string) {
    const repo = await this.prisma.role.findUnique({
      where: {
        title: repositoryTitle,
      }
    });
    if(!repo) {
      throw new NotFoundException(RepositoryBusinessErrors.RepositoryNotFound);
    }
  }


}
