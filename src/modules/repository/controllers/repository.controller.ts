import { Body, Controller, Delete, Get, Logger, Patch, Post, Req, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { Request } from "express";

import { RepositoryPermissions } from "../constants/permission-level-constants";
import { RepositoryPermissionGuard } from "../guards/repository-auth.guard";
import { RepositoryPermissionLevel } from "../decorators/repository-permissions.decorator";
import { RepositoryRouteNames } from "../constants/repository-route-names";
import { UserService } from "../../account/services/user.service";
import { UserCreateRepositoryDTO } from "../dto/add-repositories.dto";
import { RepositoryService } from "../services/repository.service";
import { UpdateRepositoryPermissionsDTO } from "../dto/update-permissions.dto";
import { DeleteRepositoryDTO } from "../dto/delete-repository.dto";


/**
 * In the API V2 architecture, resources are not controlled based on the repository that uploaded them,
 * but rather the repository that they were assigned
 *
 * Therefore, the "users" themselves are not very important,
 * they are just a way to login to access certain repositories -- the repositories provide access
 * to the actual resources.
 *
 * Therefore, the only functions for users are viewing their repositories + adding new repositories
 *
 * The only function of the controller is to retrieve the associated repository with the request, and call the correct
 * service to handle the rest. Apparently it is bad practice to couple anything related to the web in the service
 * layer, so the controller converts the request into the repository id instead.
 *
 * @author Alex Carney
 */
@ApiTags("Repository Actions")
@ApiBearerAuth()
@Controller(RepositoryRouteNames.BASE_NAME)
export class RepositoryController {

  private readonly logger = new Logger(RepositoryController.name);

  constructor(private readonly userService: UserService, private readonly repositoryService: RepositoryService) {
  }

  //--------------------------------------------------------------------------------------------------------------
  @ApiOperation({
    summary: "Returns a list of the repository's repositories",
    description: "Uses the bearer token associated with this call to authenticate the repository, and return a list of their" +
      "repositories, along with related permission levels"
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred during data fetching. There is likely something wrong with your authorization credentials"
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can use this route. You can create an account here"
  })
  @Get()
  async getRepositories(@Req() req: Request): Promise<any> {
    this.logger.log(req.user + " called getRepositories method");
    return this.repositoryService.getUserRepositories(req.user["id"]);
  }

  //--------------------------------------------------------------------------------------------------------------

  @ApiCreatedResponse({
    description: "Repository created"
  })
  @ApiBody({
    description: "Supply a name of a new repository to create. It is recommended to follow the naming" +
      "convention of LASTNAME_REPOSITORY_NAME, in order to avoid name collisions and ensure proper usage" +
      "in subsequent calls",
    type: UserCreateRepositoryDTO
  })
  @ApiOperation({
    summary: "Creates a new repository",
    description: "Creates a set of repository objects that handle permissions, and organization of data. " +
      "Creating a repository automatically gives the caller the 'owner' permission"
  })
  @ApiBadRequestResponse({
    description: "invalid repository name. It is recommended to follow the naming conventions, and avoid special characters"
  })
  @ApiInternalServerErrorResponse({
    description: "An internal error occurred while handling input data."
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can create repositories."
  })
  @Post(RepositoryRouteNames.CREATE_REPOSITORY)
  async createRepositories(@Req() req: Request, @Body() createRepositoryDTO: UserCreateRepositoryDTO) {
    this.logger.log(req.user + " called createRepositories method");
    return this.repositoryService.createRepository(req.user["id"], createRepositoryDTO);
  }

  //--------------------------------------------------------------------------------------------------------------

  @ApiOkResponse({
    description: "Permissions were updated successfully"
  })
  @ApiBody({
    description: "repository: Repository title to update permissions. " +
      "receiverEmail: Email of an existing repository to update permissions for " +
      "permissionLevel: New permission level for repository. 0 = none, 1 = read+write, 2 = admin," +
      "3 = transfer ownership",
    type: UpdateRepositoryPermissionsDTO
  })
  @ApiOperation({
    summary: "Update repository permissions",
    description: "Permission Level 0: None // Permission Level 1: Read + write // Permission Level 2: Admin, can " +
      "assign read + write to other users // Permission Level 3: Transfer ownership to another repository"
  })
  @ApiBadRequestResponse({
    description: "One of the input fields was not correctly written"
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while modifying permissions."
  })
  @ApiForbiddenResponse({
    description: "It is forbidden to change permissions of a repository with a higher permission level than yourself, or to " +
      "assign a permission level higher than the one you have. Additionally, only admins (level 2+) can change any permission"
  })
  @Patch(RepositoryRouteNames.UPDATE_PERMISSIONS)
  async updateRepositoryPermissions(@Req() req: Request, @Body() updateAdminDto: UpdateRepositoryPermissionsDTO): Promise<any> {
    this.logger.log(req.user + " called updateRepositoryPermissions method, targeting " + req.target_user);
    return this.repositoryService.updateRepositoryPermissions(req.user["id"], updateAdminDto);
  }

  //--------------------------------------------------------------------------------------------------------------


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
    type: DeleteRepositoryDTO
  })
  @Delete(RepositoryRouteNames.DELETE_REPOSITORY)
  @UseGuards(RepositoryPermissionGuard)
  @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_OWNER)
  async deleteRepository(@Req() req: Request, @Body() deleteRepositoryDTO: DeleteRepositoryDTO): Promise<any> {
    this.logger.log(req.user + " called deleteRepository method, targeting " + deleteRepositoryDTO.repository);
    return this.repositoryService.deleteRepository(req.user["id"], deleteRepositoryDTO.repository);
  }
}

