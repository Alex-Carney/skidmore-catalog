export const UserBusinessErrors = {
  UserNotFound: {
    apiErrorCode: 'E_U_001',
    errorMessage: 'User not found',
    reason: 'User with this email does not exist in the DB',
    advice: 'User emails are case sensitive, and are stored including @website.com',
    additionalInformation: ''
  },
  UserNotAuthenticated: {
    apiErrorCode: 'E_U_002',
    errorMessage: 'Authentication failed',
    reason: 'No authorization header was supplied with the incoming request',
    advice: `If the call came from the web app, click the green 'Authorize' button in the top left and login. If the call
    came from a program, ensure that a bearer token is supplied with the request`
  },
  InvalidBearerToken: {
    apiErrorCode: 'E_U_003',
    errorMessage: 'Authentication failed',
    reason: 'The token was unable to be decoded. Something is wrong with the bearer token',
    advice: 'Sign in again to receive a new bearer token',
  }


}
