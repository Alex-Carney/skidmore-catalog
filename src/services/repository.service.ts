import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, Role, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateRoleAdminDTO } from "src/resolvers/user/dto/update-admin.dto";
import { UserService } from "./user.service";
import { RepositoryBusinessErrors } from "../errors/repository.error";

@Injectable()
export class RepositoryService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}


  /**
   * @method This method creates a new role with a name based on the input 'title'. The user who is supplied in the params is automatically
   * the 'admin' of this resource, which can be updated with updateRoleAdmin. Additionally, the user is automatically added as one of the
   * "owners" of this newly created role
   * @param userId The user who is creating this role
   * @param titles

   */
async upsertRoles(userId: string, titles: string[],): Promise<User> {

    /**
     * Access the user supplied in the params, create a new role with them with the input title. Relations will be generated automatically
     */

    //this means it can work for an input array of roles
    //for each element in the domain (titles) map it to some codomain (create, where object)
    // const connectOrCreateArguments = titles.map(title => {
    //     return {create:
    //         {
    //             role:
    //                 {
    //                     create: {
    //                         title: title,
    //                     }
    //                 },
    //             permissionLevel: 3
    //     },
    //         where: {roleId_userId: {roleId: title, userId: userId}}

    //     }
    // });
    //return {create: {roleId_userId: {roleId: title, userId: userId}, permissionLevel: 3}, where: {roleId_userId: {roleId: title, userId: userId}}}

    // return this.prisma.user.update({
    //     where: {id: userId},
    //     data: {
    //         roles: {
    //             connectOrCreate: connectOrCreateArguments,
    //         }
    //     }
    // });

    // return this.prisma.user.update({
    //     where: {id: userId},
    //     data: {
    //         roles: {
    //             upsert: {
    //                 create:
    //                 {
    //                     role:
    //                         {
    //                             create: {
    //                                 title: title,
    //                             }
    //                         },
    //                     permissionLevel: 3
    //                 },
    //                 where:
    //                 {
    //                     roleId_userId: {roleId: title, userId: userId}
    //                 },
    //                 update:
    //                 {

    //                 }

    //             }
    //         }
    //     }
    // })
    const createArguments = titles.map(title => {
        return {
            role: {
                create: {
                    title: title,
                },
            },
            permissionLevel: 3,
        }
    });

    try {
      /**
       * A small quirk I don't understand, returning update data directly (inlining this statement) does not throw the
       * error properly.
       */
      const dbUpdateData = await this.prisma.user.update({
        where: {id:userId},
        data: {
          roles: {
            create: createArguments,
          }
        }
      });
      return dbUpdateData;
    } catch(err) {
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
        id: userId,
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
                title: true,
              }
            }
          }
        }
        //roles: true,
      }
    });
    return userRepositories
  } catch(err) {
    throw new NotFoundException(RepositoryBusinessErrors.UserNotFound)
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
      //step 1: Verify that a current admin of this role is the one doing the operation
      await this.authenticateUserRequest(userId, updateRoleAdminDto.role, 2);

      console.log(updateRoleAdminDto.receiverEmail);


        //errors are handled in UserService
      const receiverId = await this.userService.userIdFromEmail(updateRoleAdminDto.receiverEmail);



      console.log(receiverId);
      console.log(receiverId['id'])
      const newPermissionLevel = updateRoleAdminDto.remove ? 1 : 2; //if remove = true, revoke admin rights down to permission level 1 (read only),
        //otherwise, promote to admin
        /**
         * Creates a new relation between this repository and the users who own it. Relation is either created (user
         * did not have repository before, add them with some initial permission level) or updated (promotion/demotion
         * of users)
         */
        try {
          const upsertResponse = this.prisma.rolesOnUsers.upsert({
            where: {
              roleTitle_userId: { userId: receiverId['id'] , roleTitle: updateRoleAdminDto.role }
            },
            update: {
              permissionLevel: newPermissionLevel
            },
            create: {
              role: {
                connect: {title: updateRoleAdminDto.role}
              },
              user: {
                connect: {id: receiverId['id']}
              },
              permissionLevel: 2,

            }
          });
          return upsertResponse;
        } catch(err) {
          throw new NotFoundException(RepositoryBusinessErrors.RepositoryNotFound)
        }

  }

async accessLevel(userId: string, roleTitle: string): Promise<{permissionLevel: number}> {
    //Get the relation between this role and the user, verify access level
    /**
     * Level 0: No access
     * Level 1: Tenent/Possessor of the role. Read priviledges of role resources
     * Level 2: Admin of the role. Read, write, delete priviledges of role resources. Can add new tenents/possessors to the role
     * Level 3: Owner of this role. Can add new admins to the role, and can delete the role
     */


    const accessResponse =  this.prisma.rolesOnUsers.findUnique({
      where: {
        roleTitle_userId: { userId: userId , roleTitle: roleTitle }
      },
      select: {
        permissionLevel: true,
      }
    });
    console.log(accessResponse);
    if(!accessResponse) {
      throw new NotFoundException(RepositoryBusinessErrors.RepositoryUserRelationError);
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
                  return {message: 'Successfully deleted the ' + roleToDelete + ' repository'}
                } catch(err) {
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
    if(access['permissionLevel'] >= requiredLevel) {
      return true
    } else {
      const errorResponse = RepositoryBusinessErrors.RepositoryAuthorizationError;
      errorResponse.additionalInformation = 'Requires access level '+requiredLevel+' of this repository. You have access level ' + access['permissionLevel'];
      throw new ForbiddenException(errorResponse);
    }
  }





}
