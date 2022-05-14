/**
 * Permission Levels. This constant is used in place of integers, to make the required permissions much more distinct
 *
 * Level 0: No access
 * Level 1: User of the repository. Read privileges of repository resources
 * Level 2: Admin of the repository. Read, write, delete privileges of repository resources. Can add new possessors to the repository
 * Level 3: Owner of this repository. Can add new admins to the repository, and can delete the repository
 *
 * @author Alex Carney
 */
export const RepositoryPermissions = {
  REPOSITORY_OWNER: 3,
  REPOSITORY_ADMIN: 2,
  REPOSITORY_USER: 1,
  REPOSITORY_NO_ACCESS: 0,
}
