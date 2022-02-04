import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { DataModelService } from "../services/data-model.service";
import { DataModelGenerateInputDTO } from "../resolvers/resource/dto/data-model-input.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { DataModelPublishInputDTO } from "../resolvers/resource/dto/data-model-publish.dto";
import { Request } from "express";
import { UpdateResourceRepositoriesDTO } from "../resolvers/resource/dto/update-resource-repository.dto";
import { UpdateDataModelDTO } from "../resolvers/resource/dto/data-model-update.dto";
import { DeleteDataModelDTO } from "../resolvers/resource/dto/delete-data-model.dto";
import { AuthService } from "../services/auth.service";

@ApiBearerAuth()
@ApiTags('Resource Model')
@Controller('data-model')
export class DataModelController {
  constructor(private readonly dataModelService: DataModelService, private readonly authService: AuthService) {}

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
      "Additionally, the user may modify the generated data model before publication",
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
  @Post('generate-data-model')
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
  @Post('publish-data-model')
  async publishDataModel(@Req() req: Request, @Body() dataModelPublishInputDto: DataModelPublishInputDTO) {

    console.log(dataModelPublishInputDto)
    console.log(dataModelPublishInputDto.dataModel)


    try {
      // const dataModel = JSON.parse(dataModelPublishInputDto.dataModel);
      const user = await this.authService.getUserFromRequest(req);
      return this.dataModelService.publishDataModel(dataModelPublishInputDto.dataModel, dataModelPublishInputDto.resourceName, user['id'], dataModelPublishInputDto.repositories);
    } catch(err) {
      console.log(err);
    }
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
  @Get('/:repository')
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
  @Get('/exact/:resourceName')
  async getDataModelExactByName(@Param('resourceName') resourceName: string) {
    return this.dataModelService.returnDataModelExact(resourceName, false);
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
    type: UpdateResourceRepositoriesDTO
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
  @Put('update-resource-repositories')
  async updateDataModelRepositories(@Req() req: Request, @Body() updateRepositories: UpdateResourceRepositoriesDTO) {
    const user = await this.authService.getUserFromRequest(req);
    return this.dataModelService.updateDataModelRepositories(updateRepositories.resourceName, user['id'], updateRepositories.repository, updateRepositories.removeRepositories);
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
    type: UpdateDataModelDTO
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
  @Put('update-data-model')
  async updateDataModel(@Req() req: Request, @Body() updateDataModel: UpdateDataModelDTO) {
    const user = await this.authService.getUserFromRequest(req);
    return this.dataModelService.updateDataModelFields(updateDataModel.resourceName, user['id'], updateDataModel.repository, updateDataModel.dataModel);
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
  @Delete('delete-data-model')
  async deleteDataModel(@Req() req: Request, @Body() deleteDataModel: DeleteDataModelDTO) {
    const user = await this.authService.getUserFromRequest(req);
    return this.dataModelService.deleteDataModel(deleteDataModel.resourceName, user['id'], deleteDataModel.repository);
  }

}
