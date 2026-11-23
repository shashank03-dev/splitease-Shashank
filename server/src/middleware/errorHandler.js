/**
 * Central error handler. Express recognises it by its four arguments, so
 * `_next` must stay in the signature even though it is not called.
 */
export function errorHandler(error, req, res, _next) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Request body contains invalid JSON.',
    })
  }

  let status = error.status ?? error.statusCode ?? 500
  let message = error.message
  let errors = Array.isArray(error.errors) ? error.errors : undefined

  // Safety net for writes that bypass explicit controller validation.
  if (error.name === 'ValidationError') {
    status = 400
    message = 'Validation failed.'
    errors = Object.values(error.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }))
  } else if (error.name === 'CastError') {
    status = 400
    message = `Invalid value for ${error.path}.`
  }

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, error)
  }

  const payload = {
    success: false,
    message: status >= 500 ? 'Internal server error.' : message,
  }

  if (errors?.length) {
    payload.errors = errors
  }

  return res.status(status).json(payload)
}
