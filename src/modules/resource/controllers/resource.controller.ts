import { Body, Controller, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourceService } from 'src/modules/resource/services/resource.service';
import { Request, Response } from "express";
import { SeedDatabaseInputDTO } from 'src/modules/resource/dto/seed-database.dto';
import { QueryDatabaseInputDTO } from 'src/modules/resource/dto/query-database.dto';
import { AuthService } from "../../authentication/services/auth.service";
import { UserService } from "../../../services/user.service";
import { RepositoryPermissions } from "../../repository/constants/permission-level-constants";
import { RepositoryPermissionGuard } from "../../repository/guards/repository-auth.guard";
import { RepositoryPermissionLevel } from "../../repository/decorators/repository-permissions.decorator";
import { ResourceAccessAuthGuard } from "../guards/resource-access-auth-guard.service";

@ApiBearerAuth()
@Controller('resources')
export class ResourceController {

    constructor(private readonly resourceService: ResourceService, private readonly userService: UserService) {}

    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiBody({
        description: 'List of celestial locations',
        type: SeedDatabaseInputDTO
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file')) //takes two arguments: fieldName which is the HTML field holding the file
    @ApiTags('Resource Data')
    @Put('seed-database')
    async seedDatabase(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Body()
      seedDatabaseInputDto: SeedDatabaseInputDTO, @Res() res: Response) {
        return this.resourceService.seedResourceFromFile(file, seedDatabaseInputDto, req.user['id'], res);
    }


    @ApiOkResponse({
        description: "Query data from resource"
    })
    @ApiBody({
        description: "Input query",
        type: QueryDatabaseInputDTO
    })
    @ApiOperation({summary: "query a resource using SQL"})
    @ApiTags('Resource Data')
    @Post('query-database')
    @UseGuards(RepositoryPermissionGuard, ResourceAccessAuthGuard)
    @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_USER)
    async queryDatabase(@Req() req: Request, @Body() queryDatabaseInputDto: QueryDatabaseInputDTO) {
        try {
            const user = await this.userService.getUserFromRequest(req);

            const payload = await this.resourceService.queryResource
            (
                queryDatabaseInputDto.resourceName,
                user['id'],
                queryDatabaseInputDto.repository,
                queryDatabaseInputDto.SQL_Select_Fields,
                queryDatabaseInputDto.SQL_Where_Fields,
                queryDatabaseInputDto.SQL_Where_Statement
            );
            return payload;
        } catch(err) {
            console.log(err);
        }
    }



}
