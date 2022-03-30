import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { DataModelService } from "../services/data-model.service";
import { DataModelGenerateInputDTO } from "../dto/data-model-input.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { DataModelPublishInputDTO } from "../dto/data-model-publish.dto";
import { Request } from "express";
import { UpdateDataModelRepositoriesDTO } from "../dto/update-resource-repository.dto";
import { UpdateDataModelFieldsDTO } from "../dto/data-model-update.dto";
import { DeleteDataModelDTO } from "../dto/delete-data-model.dto";
import { UserService } from "../../../services/user.service";
import { UpdateDataModelFieldNamesDTO } from "../dto/update-data-model-names.dto";
import { RepositoryPermissionGuard } from "../../repository/guards/repository-auth.guard";
import { RepositoryPermissionLevel } from "../../repository/decorators/repository-permissions.decorator";
import { RepositoryPermissions } from "../../repository/constants/permission-level-constants";
import { DataModelRouteNames } from "../constants/data-model-route-names";
import { ResourceAuthGuard } from "../guards/resource-auth.guard";

@ApiBearerAuth()
@ApiTags('Resource Model')
@Controller(DataModelRouteNames.BASE_NAME)
export class DataModelController {
  constructor(private readonly dataModelService: DataModelService, private readonly userService: UserService) {}

  //---------------------------------------------------------------------------------------------------------

  @ApiOkResponse({
    description: 'JSON Data model to copy and use in subsequent API calls',
    status: 200,
  })
  @ApiBody({
    description: 'File containing delimited data you wish to store. Ensure headers are present, and no column is completely null',
    required: true,
    type: DataModelGenerateInputDTO
  })
  @ApiOperation({
    summary: "Creates a data model for review and publication",
    description: "Parses the file uploaded, recording column names and column data types. Possible data types are 'numeric' or 'text'. " +
      "Potential errors may occur if a column is entirely null (cannot define datatype). " +
      "Additionally, the repository may modify the generated data model before publication",
    // externalDocs
  })
  @ApiBadRequestResponse({
    description: "File was not uploaded to the API correctly",
    // status:
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while parsing the file and generating the data model. More information in response body",
    // status:
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can generate data models. You can do so here" //TODO: insert link
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file')) //takes two arguments: fieldName which is the HTML field holding the file
  @Post(DataModelRouteNames.GENERATE_DATA_MODEL)
  async generateDataModel(@UploadedFile() file: Express.Multer.File) {
    return this.dataModelService.generateDataModel(file);
  }

//------------------------------------------------------------------------------------------------------------------

  @ApiCreatedResponse({
    description: 'A data model representing this resource has been created'
  })
  @ApiBody({
    description: 'resourceName: The name you wish to refer to this resource by. IMPORTANT: Duplicate names across the entire ' +
      'application are not allowed. It is recommended to use the convention lastname_tablename in order to prevent collision with' +
      'other users\' data \n' +
      'repositories: The repositories this data model will be added to. Input can be a single repository or a comma separated list \n' +
      'dataModel: The data model generated from \'generate data model API route\'. Copy and paste into the data model field',
    required: true,
    type: DataModelPublishInputDTO
  })
  @ApiOperation({
    summary: "Publishes the data model to support future data management",
    description: "Creates a \'resource\' object that represents the table, as well as an empty table that will eventually hold the raw" +
      "incoming data",
    // externalDocs
  })
  @ApiBadRequestResponse({
    description: "One of the input fields was not correctly written",
    // status:
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while publishing. Table name may not have been unique, repository may not be correct, table name may be invalid",
    // status:
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can publish data models. You can do so here" //TODO: insert link
  })
  @Post(DataModelRouteNames.PUBLISH_DATA_MODEL)
  @UseGuards(RepositoryPermissionGuard)
  @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_ADMIN)
  async publishDataModel(@Req() req: Request, @Body() dataModelPublishInputDTO: DataModelPublishInputDTO) {

    console.log(dataModelPublishInputDTO)
    console.log(dataModelPublishInputDTO.dataModel)

    // const user = await this.userService.getUserFromRequest(req);
    return this.dataModelService.publishDataModel(req.user['id'], dataModelPublishInputDTO);

  }

  //-----------------------------------------------------------------------

  @ApiOkResponse({
    description: 'Information about all the resources stored in a repository'
  })
  @ApiOperation({
    summary: "View detailed information about all resources in a repository",
    description: ""
    // externalDocs
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while fetching this repository's data. It may not exist",
    // status:
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can use this route. You can do so here, or sign in here" //TODO: insert link
  })
  @Get(DataModelRouteNames.GET_BY_REPOSITORY)
  async getDataModelByRepositories(@Param('repository') repository: string) {
    return this.dataModelService.returnDataModels(repository);
  }

  //----------------------------------------------------------------


  @ApiOperation({
    summary: "Returns a data model in exact format, ready to be used for other routes",
    description: "Returns the exact data model for a resource. This data model can be copy and pasted " +
      "and used in other routes, such as publish or update",
    // externalDocs
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while fetching this data. The resource or repository might not exist"
    // status:
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can use this route. You can do so here, or sign in here" //TODO: insert link
  })
  //@ApiTags('Resource Model Exact')
  @Get(DataModelRouteNames.GET_BY_REPOSITORY_EXACT)
  async getDataModelExactByName(@Param('resourceName') resourceName: string) {
    return this.dataModelService.returnDataModelExact(resourceName, false, false);
  }

  //---------------------------------------------------------------------------

  @ApiCreatedResponse({
    description: ''
  })
  @ApiBody({
    description: 'resourceName: The resource whose data model is to be updated \n' +
      'repository: The repository to access this model with. Requires admin privileges \n' +
      'dataModel: The NEW data model, containing all changes to be updated. It is recommended to paste a generated data model first, then update accordingly',
    required: true,
    type: UpdateDataModelRepositoriesDTO
  })
  @ApiOperation({
    summary: "Updates existing data model",
    description: "Looks for the differences between incoming data model and existing one, and makes changes accordingly. \n " +
      "Changes may include dropping columns, adding new columns, renaming columns, or altering data type of columns \n " +
      "WARNING: The logic behind this service is quite complicated and may have many issues. Try to refrain from using this route, " +
      "and use caution if necessary. Data may need to be re-uploaded after updating the data model. \n " +
      "It is recommended to make changes when there is NO data stored inside of the relevant data model"
    // externalDocs
  })
  @ApiBadRequestResponse({
    description: "One of the input fields was not correctly written",
    // status:
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while publishing. Input fields may have been incorrect, or an error occurred in the service logic"
    // status:
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can publish data models. You can do so here" //TODO: insert link
  })
  @Put(DataModelRouteNames.UPDATE_DATA_MODEL_REPOSITORIES)
  @UseGuards(RepositoryPermissionGuard)
  @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_ADMIN)
  async updateDataModelRepositories(@Req() req: Request, @Body() updateDataModelRepositoriesDTO: UpdateDataModelRepositoriesDTO) {
    // const user = await this.userService.getUserFromRequest(req);
    return this.dataModelService.updateDataModelRepositories(req.user['id'], updateDataModelRepositoriesDTO);
  }

  //------------------------------------------------------------------------

  @ApiCreatedResponse({
    description: 'Data has been successfully modified. This can be confirmed with /exact/resourceName'
  })
  @ApiBody({
    description: 'resourceName: The resource whose data model is to be updated \n' +
      'repository: The repository to access this model with. Requires admin privileges \n' +
      'dataModel: The NEW data model, containing all changes to be updated. It is recommended to paste a generated data model first, then update accordingly',
    required: true,
    type: UpdateDataModelFieldsDTO
  })
  @ApiOperation({
    summary: "Updates existing data model",
    description: "Looks for the differences between incoming data model and existing one, and makes changes accordingly. \n " +
      "Changes may include dropping columns, adding new columns, renaming columns, or altering data type of columns \n " +
      "WARNING: The logic behind this service is quite complicated and may have many issues. Try to refrain from using this route, " +
      "and use caution if necessary. Data may need to be re-uploaded after updating the data model. \n " +
      "It is recommended to make changes when there is NO data stored inside of the relevant data model"
    // externalDocs
  })
  @ApiBadRequestResponse({
    description: "One of the input fields was not correctly written",
    // status:
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while publishing. Input fields may have been incorrect, or an error occurred in the service logic"
    // status:
  })
  @ApiForbiddenResponse({
    description: "Only users with accounts can publish data models. You can do so here" //TODO: insert link
  })
  @Put(DataModelRouteNames.UPDATE_DATA_MODEL)
  @UseGuards(RepositoryPermissionGuard, ResourceAuthGuard)
  @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_ADMIN)
  async updateDataModel(@Req() req: Request, @Body() updateDataModelFieldsDTO: UpdateDataModelFieldsDTO) {
    // const user = await this.userService.getUserFromRequest(req);
    return this.dataModelService.updateDataModelFields(req.user['id'], updateDataModelFieldsDTO);
  }

  @ApiBody({
    description: "Test",
    type: UpdateDataModelFieldNamesDTO
  })
  @Put(DataModelRouteNames.UPDATE_DATA_MODEL_COLUMN_NAMES)
  @UseGuards(RepositoryPermissionGuard, ResourceAuthGuard)
  @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_ADMIN)
  async renameDataModelFields(@Req() req: Request, @Body() updateDataModelFieldNamesDTO: UpdateDataModelFieldNamesDTO) {
    // const user = await this.userService.getUserFromRequest(req);
    return this.dataModelService.alterDataModelColumnNames(req.user['id'], updateDataModelFieldNamesDTO);
  }

//------------------------------------------------------------------------------------

  @ApiCreatedResponse({
    description: 'Data has been successfully modified. This can be confirmed with /exact/resourceName'
  })
  @ApiBody({
    description: 'resourceName: The resource to be deleted \n' +
      'repository: The repository to access this model with. Requires OWNERSHIP privileges \n',
    required: true,
    type: DeleteDataModelDTO
  })
  @ApiOperation({
    summary: "Deletes data model and all data stored under that model",
    description: "Removes the record of the data, along with all instances of the actual data itself. Irreversible"
    // externalDocs
  })
  @ApiBadRequestResponse({
    description: "One of the input fields was not correctly written",
    // status:
  })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while deleting. An input field may be incorrect",
    // status:
  })
  @ApiForbiddenResponse({
    description: "Deleting a data model requires ownership of the repository" //TODO: insert link
  })
  @Delete(DataModelRouteNames.DELETE_DATA_MODEL)
  @UseGuards(RepositoryPermissionGuard, ResourceAuthGuard)
  @RepositoryPermissionLevel(RepositoryPermissions.REPOSITORY_OWNER)
  async deleteDataModel(@Req() req: Request, @Body() deleteDataModelDTO: DeleteDataModelDTO) {
    // const user = await this.userService.getUserFromRequest(req);
    return this.dataModelService.deleteDataModel(req.user['id'], deleteDataModelDTO);
  }

}
