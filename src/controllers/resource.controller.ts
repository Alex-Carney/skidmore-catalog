import { Body, Controller,  Delete,  Get,  Param,  Patch,  Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LocationUpload } from 'src/models/inputs/location-upload.input';
import { ResourceService } from 'src/services/resource.service';
import { Request } from "express";
import { DataModelGenerateInputDTO } from 'src/resolvers/resource/dto/data-model-input.dto';
import { DataModelPublishInputDTO } from 'src/resolvers/resource/dto/data-model-publish.dto';
import { UserService } from 'src/services/user.service';
import { SeedDatabaseInputDTO } from 'src/resolvers/resource/dto/seed-database.dto';
import { QueryDatabaseInputDTO } from 'src/resolvers/resource/dto/query-database.dto';
import { parseAsync } from 'json2csv';
import { DeleteDataModelDTO } from 'src/resolvers/resource/dto/delete-data-model.dto';
import { UpdateDataModelDTO } from 'src/resolvers/resource/dto/data-model-update.dto';
import { UpdateResourceRepositoriesDTO } from 'src/resolvers/resource/dto/update-resource-repository.dto';

@ApiBearerAuth()
@Controller('resources')
export class ResourceController {

    constructor(private readonly resourceService: ResourceService, private readonly userService: UserService) {}

    //---------------------------------------------------------------------------------------------------------

    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiBody({
        description: 'List of celestial locations',
        type: DataModelGenerateInputDTO
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file')) //takes two arguments: fieldName which is the HTML field holding the file
    @ApiTags('Resource Model')
    //(default: 'file') and MulterOptions
    @Post('generate-data-model')
    async generateDataModel(@UploadedFile() file: Express.Multer.File) {
        // const buf = file.buffer
        // console.log(buf.toString());
        return this.resourceService.generateDataModel(file);
    }

    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiBody({
        description: 'List of celestial locations',
        type: DataModelPublishInputDTO
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiTags('Resource Model')
    @Post('publish-data-model')
    async publishDataModel(@Req() req: Request, @Body() dataModelPublishInputDto: DataModelPublishInputDTO) {

        console.log(dataModelPublishInputDto)
        console.log(dataModelPublishInputDto.dataModel)


        try {
            // const dataModel = JSON.parse(dataModelPublishInputDto.dataModel);
            const user = await this.userService.getUserFromRequest(req);
            return this.resourceService.publishDataModel(dataModelPublishInputDto.dataModel, dataModelPublishInputDto.resourceName, user['id'], dataModelPublishInputDto.repositories);
        } catch(err) {
            console.log(err);
        }
    }

    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiTags('Resource Model')
    @Get('/:repository')
    async getDataModelByRepositories(@Param('repository') repository: string) {
        return this.resourceService.returnDataModels(repository);
    }

    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiTags('Resource Model Exact')
    @Get('/exact/:resourceName')
    async getDataModelExactByName(@Param('resourceName') resourceName: string) {
        return this.resourceService.returnDataModelExact(resourceName, false);
    }

    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiBody({
        description: 'Delete body',
        type: UpdateResourceRepositoriesDTO
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiTags('Resource Data')
    @Put('update-resource-repositories')
    async updateDataModelRepositories(@Req() req: Request, @Body() updateRepositories: UpdateResourceRepositoriesDTO) {
        const user = await this.userService.getUserFromRequest(req);
        return this.resourceService.updateDataModelRepositories(updateRepositories.resourceName, user['id'], updateRepositories.repository, updateRepositories.removeRepositories);
    }

    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiBody({
        description: 'Delete body',
        type: UpdateDataModelDTO
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiTags('Resource Model')
    @Put('update-data-model')
    async updateDataModel(@Req() req: Request, @Body() updateDataModel: UpdateDataModelDTO) {
        const user = await this.userService.getUserFromRequest(req);
        return this.resourceService.updateDataModelFields(updateDataModel.resourceName, user['id'], updateDataModel.repository, updateDataModel.dataModel);
    }



    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiBody({
        description: 'Delete body',
        type: DeleteDataModelDTO
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiTags('Resource Model')
    @Delete('delete-data-model')
    async deleteDataModel(@Req() req: Request, @Body() deleteDataModel: DeleteDataModelDTO) {
        const user = await this.userService.getUserFromRequest(req);
        return this.resourceService.deleteDataModel(deleteDataModel.resourceName, user['id'], deleteDataModel.repository);
    }


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
    async seedDatabase(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Body() seedDatabaseInputDto: SeedDatabaseInputDTO) {
        try {
            const user = await this.userService.getUserFromRequest(req);
            return this.resourceService.handleFile(file, seedDatabaseInputDto.resourceName, user['id'], seedDatabaseInputDto.repository);
        } catch(err) {
            console.log(err);
        }
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
