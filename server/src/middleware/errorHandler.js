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

  const status = error.status ?? error.statusCode ?? 500

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, error)
  }

  return res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error.' : error.message,
  })
}
