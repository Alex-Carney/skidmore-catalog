import { Body, Controller, Delete, Get, Patch, Post, Req } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOkResponse,
    ApiOperation,
    ApiTags
} from "@nestjs/swagger";
import { User } from "@prisma/client";
import { Request } from "express";
import { UserCreateRepositoryDTO } from "src/resolvers/user/dto/add-repositories.dto";
import { DeleteRepositoryDTO } from "src/resolvers/user/dto/delete-repository.dto";
import { UpdateRoleAdminDTO } from "src/resolvers/user/dto/update-admin.dto";
import { AuthService } from "src/services/auth.service";
import { RepositoryService } from "src/services/repository.service";
import { UserService } from "src/services/user.service";


    /**
     * In the API V2 architecture, resources are not controlled based on the user that uploaded them, but rather the ROLE that they were assigned
     * Therefore, the "users" themselves are not very important, they are just a way to login to access certain roles -- the roles provide access
     * to the actual resources.
     *
     * Therefore, the only functions for users are viewing their roles + adding new roles
     */


@ApiTags("Repository Actions")
@ApiBearerAuth()
@Controller('repository')
export class UserController {

    constructor(private readonly userService: UserService, private readonly authService: AuthService, private readonly roleService: RepositoryService) {}

    //--------------------------------------------------------------------------------------------------------------
    @ApiOperation({
        summary: "Returns a list of the user's repositories",
        description: "Uses the bearer token associated with this call to authenticate the user, and return a list of their" +
          "repositories, along with related permission levels"
    })
    @ApiInternalServerErrorResponse({
        description: "An error occurred during data fetching. There is likely something wrong with your authorization credentials"
    })
    @ApiForbiddenResponse({
        description: "Only users with accounts can use this route. You can create an account here"
    })
    @Get()
    async viewRoles(@Req() req: any): Promise<any> {
        const user = await this.userService.getUserFromRequest(req);
        return this.roleService.getUserRoles(user['id']);
    }

    @ApiCreatedResponse({
        description: 'Each repository listed was created'
    })
    @ApiBody({
        description: "Supply a list of repositories to create. It is recommended to follow the naming" +
          "convention of LASTNAME_REPOSITORY_NAME, in order to avoid name collisions and ensure proper usage" +
          "in subsequent calls",
        type: UserCreateRepositoryDTO,
    })
    @ApiOperation({
        summary: "Creates new repositories",
        description: "Creates a set of repository objects that handle permissions, and organization of data. " +
          "Creating a role automatically gives the caller the 'owner' permission"
    })
    @ApiBadRequestResponse({
        description: 'invalid repository name. It is recommended to follow the naming conventions, and avoid special characters'
    })
    @ApiInternalServerErrorResponse({
        description: "An internal error occurred while handling input data. Try publishing one role at a time"
    })
    @ApiForbiddenResponse({
        description: "Only users with accounts can create repositories."
    })
    @Post('create-repositories')
    async addRoles(@Req() req: Request, @Body() addRoleDto: UserCreateRepositoryDTO) {
        const user = await this.userService.getUserFromRequest(req);

        console.log(addRoleDto.repositories);
        console.log(typeof(addRoleDto.repositories));

        return this.roleService.upsertRoles(user['id'], addRoleDto.repositories);
    }

    @ApiOkResponse({
        description: "Permissions were updated successfully"
    })
    @ApiBody({
        description: "repository: Repository title to update permissions. " +
          "receiverEmail: Email of an existing user to update permissions for " +
          "permissionLevel: New permission level for user. 0 = none, 1 = read+write, 2 = admin," +
          "3 = transfer ownership",
        type: UpdateRoleAdminDTO
    })
    @ApiOperation({
        summary: "Update repository permissions",
        description: "Permission Level 0: None // Permission Level 1: Read + write // Permission Level 2: Admin, can " +
          "assign read + write to other users // Permission Level 3: Transfer ownership to another user",
    })
    @ApiBadRequestResponse({
        description: "One of the input fields was not correctly written"
    })
    @ApiInternalServerErrorResponse({
        description: "An error occurred while modifying permissions."
    })
    @ApiForbiddenResponse({
        description: "It is forbidden to change permissions of a user with a higher permission level than yourself, or to " +
          "assign a permission level higher than the one you have. Additionally, only admins (level 2+) can change any permission"
    })
    @Patch('update-permissions')
    async updateRoleAdmins(@Req() req: Request, @Body() updateAdminDto: UpdateRoleAdminDTO): Promise<any> {
        const user = await this.userService.getUserFromRequest(req);
        return this.roleService.updateRoleAdmins(user['id'], updateAdminDto)
    }


    @ApiOkResponse({
        description: "Repository successfully deleted"
    })
    @ApiOperation({
        summary: "Deletes an existing repository",
        description: "Deletes a repository from the DB, along with all permission information. Requires ownership"
    })
    @ApiForbiddenResponse({
        description: "Requires ownership of repository"
    })
    @ApiInternalServerErrorResponse({
        description: "An error occurred while deleting"
    })
    @ApiBody({
        description: "repository: Title of repository to delete",
        type: DeleteRepositoryDTO,
    })
    @Delete('delete-repositories')
    async deleteRole(@Req() req: Request, @Body() removeRoleDto: DeleteRepositoryDTO): Promise<any> {
        const user = await this.userService.getUserFromRequest(req);
        return this.roleService.deleteRole(user['id'], removeRoleDto.repository);
    }
}

