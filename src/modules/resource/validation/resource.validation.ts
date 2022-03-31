import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/services/prisma.service";
import { ResourceBusinessErrors } from "../errors/resource.error";
import { Resource, ResourceField } from "@prisma/client";

@Injectable()
export class ResourceValidation {
  constructor(private prisma: PrismaService) {}

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
    if(resourceFromTitle) {
      throw new BadRequestException(ResourceBusinessErrors.ResourceAlreadyExists)
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
  async validateResourceFieldExistence(resourceName: string, resourceFieldName: string): Promise<Resource & {fields: ResourceField[]}> {
    const resourceFieldFromResource = await this.prisma.resource.findUnique({
      where: {
        title: resourceName,
      },
      include: {
        fields: {
          where: {
            fieldName: resourceFieldName
          }
        }
      }
    })

    console.log(resourceFieldFromResource.fields)
    console.log(resourceFieldFromResource.fields.length)
    if(resourceFieldFromResource.fields.length === 0) {
      throw new NotFoundException(ResourceBusinessErrors.ResourceFieldNotFound)
    } else {
      return resourceFieldFromResource;
    }
  }









}
