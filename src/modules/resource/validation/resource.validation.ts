import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../../prisma/services/prisma.service";
import { ResourceBusinessErrors } from "../errors/resource.error";
import { Resource, ResourceField } from "@prisma/client";
import { CustomException } from "../../../errors/custom.exception";
import { ConfigService } from "@nestjs/config";
import { ApiConfig } from "../../../configs/config.interface";

/**
 * An injectable service that can be used internally or by other modules to determine
 * if certain actions are valid or not, such as a non-authorized repository
 * attempting to access a resource, or attempting to access a resource that
 * doesn't exist
 * @param prisma dependency
 * @param configService dependency, in order to determine if certain inputs (for delimiters, etc.) are acceptable
 * @author Alex Carney
 */
@Injectable()
export class ResourceValidation {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService) {
  }

  private readonly logger = new Logger(ResourceValidation.name)

  /**
   * @method Returns the requested resource, or throws an exception either if the resource doesn't exist, or if it is not
   * accessible from the input repository.
   *
   * @param repositoryName
   * @param resourceName
   * @throws ForbiddenException if the resource exists, but is not accessible by the input repository
   */
  async validateResourceAccessFromRepository(repositoryName: string, resourceName: string): Promise<boolean> {
    const resourceOnRepository = await this.prisma.resourcesOnRepositories.findUnique({
      where: {
        resourceTitle_repositoryTitle: {
          repositoryTitle: repositoryName,
          resourceTitle: resourceName
        }
      }
    });
    if (!resourceOnRepository) {
      const errorToThrow = ResourceBusinessErrors.ResourceNotInRepository;
      errorToThrow.additionalInformation = resourceName + " is not accessible from " + repositoryName;
      throw new ForbiddenException(errorToThrow);
    } else {
      // return resourceOnRepository;
      return true;
    }
  }

  //----------------------------------------------------------------------------------------


  /**
   * Validate that a resource with this name already exists, throw an exception if it doesnt
   * @param resourceName
   * @throws NotFoundException
   */
  async validateResourceExistence(resourceName: string) {
    const resourceFromTitle = await this.prisma.resource.findUnique({
      where: {
        title: resourceName
      }
    });
    if (!resourceFromTitle) {
      throw new NotFoundException(ResourceBusinessErrors.ResourceNotFound);
    }
    return resourceFromTitle;
  }

  /**
   * Validate that creating a new resource with this name WOULD NOT cause duplication
   * @param resourceName
   * @throws BadRequestException Resource with this name already exists
   */
  async validateResourceNameDoesNotAlreadyExist(resourceName: string) {
    const resourceFromTitle = await this.prisma.resource.findUnique({
      where: {
        title: resourceName
      }
    });
    if (resourceFromTitle) {
      throw new BadRequestException(ResourceBusinessErrors.ResourceAlreadyExists);
    }
  }

  //----------------------------------------------------------------------------------------

  /**
   * @method returns the requested resource field. Throws an exception if it does not exist within the supplied resource
   *
   * @param resourceName
   * @param resourceFieldName
   * @throws NotFoundException the resource field may exist, but not within the supplied resource.
   */
  async validateResourceFieldExistence(resourceName: string, resourceFieldName: string): Promise<Resource & { fields: ResourceField[] }> {
    const resourceFieldFromResource = await this.prisma.resource.findUnique({
      where: {
        title: resourceName
      },
      include: {
        fields: {
          where: {
            fieldName: resourceFieldName
          }
        }
      }
    });

    this.logger.log(resourceFieldFromResource.fields);
    this.logger.log(resourceFieldFromResource.fields.length);
    if (resourceFieldFromResource.fields.length === 0) {
      throw new NotFoundException(ResourceBusinessErrors.ResourceFieldNotFound);
    } else {
      return resourceFieldFromResource;
    }
  }

  /**
   * Returns true if buffer size is within allowed input. Otherwise throws
   * an exception
   * @param bufferSize
   * @throws InvalidBufferSize exception
   */
  async validateBufferSizeInput(bufferSize: number) {
    const validation = bufferSize <= 600 && bufferSize >= 10;
    if (!validation) {
      throw new CustomException(ResourceBusinessErrors.InvalidBufferSize,
        `Input of ${bufferSize} is invalid. Buffer size must be between 10 and 600`,
        HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  /**
   * Returns true if delimiter is one of allowed values. Otherwise throws
   * an exception
   * @param delimiter Must be included in 'supportedDelimiters' list in global config
   * @throws InvalidDelimiter exception
   */
  async validateDelimiterInput(delimiter: string) {
    const apiConfig = this.configService.get<ApiConfig>('api_config');
    const validation = apiConfig.supportedDelimiters.includes(delimiter);
    if (!validation) {
      throw new CustomException(ResourceBusinessErrors.InvalidDelimiter,
        `Input of ${delimiter} is invalid`,
        HttpStatus.BAD_REQUEST);
    }
    return true;
  }


  /**
   * Returns true if file type is one of the allowed values. Otherwise throws
   * an exception
   * @param fileType Must be excluded in 'supportedFileTypes' list in global config
   * @throws InvalidFileType exception
   */
  async validateFiletype(fileType: string) {
    const apiConfig = this.configService.get<ApiConfig>('api_config');
    const properType = apiConfig.allowedFileTypes.includes(fileType);
    if (!properType) {
      throw new CustomException(ResourceBusinessErrors.InvalidFileType,
        `Input filetype of ${fileType} is invalid`,
        HttpStatus.BAD_REQUEST)
    }
  }


}
