/**
 * NOTE:
 * I really wanted to use ClassValidator in this project, as it would have been a much easier way to
 * validate user input into the API, instead of having to do most of it manually.
 *
 * However, when I tried to do this, there was a recent error between the current versions of Nest and ClassValidator
 * that made it impossible. I may return to ClassValidator in a future update, but for now I'm handling most
 * validation manually.
 *
 * I'll keep this class here even though it's unused code, just in case I return later, and to see what a
 * ClassValidator implementation looks like
 * @author Alex Carney
 */

// import { HttpStatus, Injectable } from "@nestjs/common";
// import {
//   registerDecorator,
//   ValidationOptions,
//   ValidatorConstraint,
//   ValidatorConstraintInterface
// } from "class-validator";
// import { RepositoryService } from "../services/repository.service";
// import { CustomException } from "../../../errors/custom.exception";
// import { RepositoryBusinessErrors } from "../errors/repository.error";
// import { RepositoryValidation } from "./repository.validation";
// import { PrismaService } from "../../prisma/services/prisma.service";
//
// @ValidatorConstraint({name: 'RepositoryExists', async: false})
// @Injectable()
// /**
//  * @decorator Used to decorate DTO objects to enforce that input repository fields refer to existing repositories.
//  * If the request is invalid (wrong data type), an exception will be thrown, raising the default class validator message.
//  * Otherwise, if the request is valid (correct data type), but a repository of that name does not exist, a custom
//  * exception will be raised.
//  * @param repositoryTitle
//  */
// export class RepositoryExistsRule implements ValidatorConstraintInterface {
//   constructor(private repositoryService: RepositoryService) {}
//
//   async validate(repositoryTitle: string) {
//     console.log("Repository Exists rule fired")
//     let repo;
//     try {
//       repo = await this.repositoryService.getRepositoryByName(repositoryTitle)
//     } catch (e) {
//       return false
//     }
//     if (!repo) {
//       throw new CustomException(RepositoryBusinessErrors.RepositoryNotFound,
//         repositoryTitle + " was an invalid repository title",
//         HttpStatus.NOT_FOUND);
//     }
//     return true
//   }
// }
//
// export function RepositoryExists(validationOptions?: ValidationOptions) {
//   return function (object: any, propertyName: string) {
//     registerDecorator({
//       name: 'RepositoryExists',
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       validator: RepositoryExistsRule,
//     });
//   };
// }
