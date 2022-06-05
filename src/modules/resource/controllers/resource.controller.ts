import {
  Body,
  Controller,
  Logger,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { RepositoryPermissions } from "../../repository/constants/permission-level-constants";
import { RepositoryPermissionGuard } from "../../repository/guards/repository-auth.guard";
import { RepositoryPermissionLevel } from "../../repository/decorators/repository-permissions.decorator";
import { ResourceAccessAuthGuard } from "../guards/resource-access-auth-guard.service";
import { ResourceRouteNames } from "../constants/resource-route-names";
import { ResourceService } from "../services/resource.service";
import { SeedDatabaseInputDTO } from "../dto/seed-database.dto";
import { QueryDatabaseInputDTO } from "../dto/query-database.dto";
import { ProperBodyGuard } from "../../../guards/proper-body.guard";
import { BodyDto } from "../../../decorators/route-dto.decorator";

/**
 * Handles CRUD operations for data models. Has some extra routes as well,
 * since creating and publishing a data model are two separate actions (that
 * need to be done sequentially)
 *
 * This controller's only function is to perform initial input validation (through
 * middleware, applied in @see resource.module.ts), then call the appropriate
 * service to handle the call
 *
 * @author Alex Carney
 */
@ApiBearerAuth()
@Controller(ResourceRouteNames.BASE_NAME)
export class ResourceController {

  private readonly logger = new Logger(ResourceController.name)

  constructor(private readonly resourceService: ResourceService) {
  }

  @ApiOkResponse({
    description: "upload a file of celestial locations"
  })
  @ApiBody({
    description: "List of celestial locations",
    type: SeedDatabaseInputDTO
  })
  @ApiOperation({ summary: "search by location - upload a file with celestial coordinates" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file")) //takes two arguments: fieldName which is the HTML field holding the file
  @ApiTags("Resource Data")
  @Put(ResourceRouteNames.SEED_DATABASE)
  async seedDatabase(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Body()
    seedDatabaseInputDto: SeedDatabaseInputDTO, @Res() res: Response) {

    //TODO : BIG TODO!!! WE NEED TO VALIDATE THAT THE PERSON SEEDING IS
    // AN ADMIN, AND THAT THE REPOSITORY HAS ACCESS. WE CAN'T JUST ADD
    // THE GUARDS AS-IS BECAUSE THIS IS MULTIPART/FORM-DATA NOT JSON


    this.logger.log(req.user + " is seeding the database")
    return this.resourceService.seedResourceFromFile(file, seedDatabaseInputDto, req.user["id"], res);
  }


  @ApiOkResponse({
    description: "Query data from resource"
  })
  @ApiBody({
    description: "Input query",
    type: QueryDatabaseInputDTO
  })
  @ApiOperation({ summary: "query a resource using SQL" })
  @ApiTags("Resource Data")
  @Post(ResourceRouteNames.QUERY_DATABASE)
  @UseGuards(RepositoryPermissionGuard, ResourceAccessAuthGuard, ProperBodyGuard)
  @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_USER)
  @BodyDto(QueryDatabaseInputDTO)
  async queryDatabase(@Req() req: Request, @Body() queryDatabaseInputDto: QueryDatabaseInputDTO) {
      return await this.resourceService.queryResource
      (
        queryDatabaseInputDto.resourceName,
        req.user,
        queryDatabaseInputDto.repository,
        queryDatabaseInputDto.SQL_Select_Fields,
        queryDatabaseInputDto.SQL_Where_Fields,
        queryDatabaseInputDto.SQL_Where_Statement
      );
  }
}
