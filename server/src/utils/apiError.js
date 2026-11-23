/**
 * Error type for expected API failures (for example a 400 validation error).
 * The central error handler reads `status` and the optional `errors` array.
 */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status

    if (Array.isArray(errors) && errors.length > 0) {
      this.errors = errors
    }
  }
}
