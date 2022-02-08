export const RepositoryBusinessErrors = {
  RepositoryNotFound: {
    apiErrorCode: 'E_R_001',
    errorMessage: 'Repository not found',
    reason: 'Provided repository does not exist in DB.',
    advice: 'Repo names are case sensitive and should be all caps',
    additionalInformation: '',
  },

  RepositoryAlreadyExists: {
    apiErrorCode: 'E_R_002',
    errorMessage: 'Repository already exists',
    reason: 'A repository with the provided name already exists in DB. Repo names must be unique',
    advice: 'Modify input name to LASTNAME_REPONAME, in all caps'
  },

  UserNotFound: {
    apiErrorCode: 'E_R_003',
    errorMessage: 'Provided user not found',
    reason: 'Provided user does not have the supplemented repository, so it cannot be removed',
    advice: 'Set "remove = false" to add the repository to the supplemented user'
  },

  RepositoryAuthorizationError: {
    apiErrorCode: 'E_R_004',
    errorMessage: 'Unauthorized',
    reason: 'You do not have the necessary access level to perform this operation on this repository',
    additionalInformation: '',
  },

  RepositoryUserRelationError: {
    apiErrorCode: 'E_R_005',
    errorMessage: 'Relation does not exist',
    reason: 'There is no relation between this user and this repository. This is a bug, and should not occur',
    advice: 'Try making supplied user an admin (demoting them afterward if necessary) to instantiate this relation'
  },

  InvalidPermissionLevel: {
    apiErrorCode: 'E_R_006',
    errorMessage: 'Invalid request',
    reason: 'Permission level must be an integer between 0 and 3.',
    additionalInformation: '0 means no access // 1 means user (read/write) // 2 means admin // 3 means owner'
  }



}
