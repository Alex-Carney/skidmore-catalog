import { Injectable } from "@nestjs/common";
import { prisma, Role, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateRoleAdminDTO } from "src/resolvers/user/dto/update-admin.dto";
import { UserService } from "./user.service";

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}


  /**
   * @method This method creates a new role with a name based on the input 'title'. The user who is supplied in the params is automatically
   * the 'admin' of this resource, which can be updated with updateRoleAdmin. Additionally, the user is automatically added as one of the
   * "owners" of this newly created role
   * @param userId The user who is creating this role
   * @param title  The name of this role CAPS

   */
  upsertRoles(userId: string, titles: string[],): Promise<User> {

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
    return this.prisma.user.update({
        where: {id:userId},
        data: {
            roles: {
                create: createArguments,
            }
        }
    })

    /**TODO: Error handling if you try to add a role that already exists ("you must contact an admin of this role to gain access, if you're trying
    to create a new role choose a different name") **/

  }

  getUserRoles(userId: string): any {
      return this.prisma.user.findUnique({
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
      })
  }

//   async updateRoleAdmin(
//       params:

//   ) {

//   }

/**
 * @method Each role has multiple administrators. Only a role admin can change administration priviledges, and grant read/write access of resources
 * under that role to another user. By default, the creator of the role is the first admin, who can then add more using this endpoint (which uses 
 * this service)
 * 
 * @param userId current admin logged in making changes 
 * @param newAdminEmail Email (unique identifier) of new admin to be added
 * @param roleToUpdate Which of the current admin's roles is being modified 
 */
  async updateRoleAdmins(userId: string, updateRoleAdminDto: UpdateRoleAdminDTO): Promise<any> {
      //step 1: Verify that a current admin of this role is the one doing the operation
      const accessObj = await this.accessLevel(userId, updateRoleAdminDto.role);
      if(accessObj['permissionLevel'] == 3) {
        //step 2: do the transaction
        // return this.prisma.role.update({
        //     //get the role in question
        //     where: {
        //         title: updateRoleAdminDto.role,
        //     },
        //     data: {
        //         //access 'admins' data for the role
        //         admins: {
        //             //add a relation between the user in question and this role's admins
        //             connect: {
        //                 email: newAdminEmail,
        //             }
        //         }
        //     }
        // })
        console.log(updateRoleAdminDto.receiverEmail);
        const recieverId = await this.userIdFromEmail(updateRoleAdminDto.receiverEmail);
        console.log(recieverId);
        console.log(recieverId['id'])
        const newPermissionLevel = updateRoleAdminDto.remove ? 1 : 2; //if remove = true, revoke admin rights down to permission level 1 (read only),
        //otherwise, promote to admin
        return this.prisma.rolesOnUsers.upsert({
            where: {
                roleTitle_userId: { userId: recieverId['id'] , roleTitle: updateRoleAdminDto.role }
            },
            update: {
                permissionLevel: newPermissionLevel
            },
            create: {
                role: {
                    connect: {title: updateRoleAdminDto.role}
                },
                user: {
                    connect: {id: recieverId['id']}
                },
                permissionLevel: 2,

            }
        });
      } else {
          //throw an error? //You are not the owner of this role 
          return 
      }
  }

//   async function deleteRole(
//       params:

//   ) {

// //   }
//   async accessLevel(userId: string, roleToValidate: string): Promise<number> {
//     //Get the role we are trying to validate, include the list of administrators   
//     const admin = await this.prisma.role.findUnique({
//         //get the role in question  
//         where: { 


//               title: roleToValidate,
//           },
//           //include its relation to users by administration priviledges (_RoleToAdmin relation table))
//           include: {
//               admins: {
//                   //only return the admin who has the id of the user in question
//                   where: {
//                       id: userId
//                   }
//               }
//           }, 
//       });
//       console.log(admin);
//       return Boolean(admin) //empty "admin" object = false
//   }

async accessLevel(userId: string, roleTitle: string): Promise<{permissionLevel: number}> {
    //Get the relation between this role and the user, verify access level


    /**
     * Level 0: No access
     * Level 1: Tenent/Possessor of the role. Read priviledges of role resources
     * Level 2: Admin of the role. Read, write, delete priviledges of role resources. Can add new tenents/possessors to the role
     * Level 3: Owner of this role. Can add new admins to the role, and can delete the role
     */


    return this.prisma.rolesOnUsers.findUnique({
        where: {
            roleTitle_userId: { userId: userId , roleTitle: roleTitle }
        },
        select: {
            permissionLevel: true,
        }
    });
}

  async deleteRole(userId: string, roleToDelete: string): Promise<Role> {

            //step 1: Verify that a current admin of this role is the one doing the operation
            const permissionLevelObj = await this.accessLevel(userId, roleToDelete);
            if(permissionLevelObj['permissionLevel'] === 3) { //owners only
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
                await this.prisma.$executeRaw`DELETE FROM universe."Role" WHERE title = ${roleToDelete}`;
                //await this.prisma.$executeRaw('DELETE FROM $1 WHERE title = $2', 'universe."Role"', roleToDelete)
              } else {
                  //throw an error? //You are not the owner of this role 
                  return 
              }
  }

  userIdFromEmail(userEmail: string): Promise<{id: string}> {
      return this.prisma.user.findUnique({
          where: {
            email: userEmail,
          },
          select: {
              id: true,
          }
      })
  }





}
