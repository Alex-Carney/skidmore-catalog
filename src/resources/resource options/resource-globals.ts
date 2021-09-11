export enum ThresholdOptions {
    GreaterThan = 'gt',
    GreaterThanOrEqualTo = 'gte',
    LessThan = 'lt',
    LessThanOrEqualTo = 'lte',
    EqualTo = 'equals',
    NotEqualTo = 'not',
  }

/**
 * This function is part of the solution to the 'search argument' problem. It is very easy to pass 'where' data from the controller to the 
 * provider to be processed by prisma. However, it is impossible to use this same approach for 'search' inputs. 
 * https://github.com/prisma/prisma/issues/3372 for more information 
 * This function generates a JSON object in a form that can be turned into a ResourceSelect object by the function in the provider. 
 * 
 * @param dtoInclude 
 * @returns A json object that stores the correct 'search' data. 
 */
export function generateSearchJSON(dtoInclude: any) {
    const search = {}
    const includeArray = Array(...dtoInclude);
    (includeArray[0].length == 1 ? Array(dtoInclude) : includeArray).forEach((col) => {search[col] = true}) 

    return search 
}