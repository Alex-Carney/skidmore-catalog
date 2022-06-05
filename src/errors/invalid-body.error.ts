export const InvalidBodyErrors = {
  InvalidBody: {
    apiErrorCode: "E_B_000",
    errorMessage: "Invalid body supplied with request",
    reason: "POST, PATCH, DELETE routes must have a body where each field matches perfectly with the required body",
    advice: "Copy the example body directly from the Web API",
  }
}
