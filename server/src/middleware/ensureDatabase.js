import { connectDB, getDatabaseStatus } from '../config/db.js'
import { env, validateEnv } from '../config/env.js'

let connectionPromise = null

/**
 * Lazy connection for environments without a long-running process (Vercel).
 * Concurrent requests share one connection attempt, and a failed attempt is
 * retried by the next request.
 */
export async function ensureDatabase(req, res, next) {
  if (getDatabaseStatus() === 'connected') {
    next()
    return
  }

  try {
    if (!connectionPromise) {
      validateEnv()

      connectionPromise = connectDB(env.mongoUri).finally(() => {
        connectionPromise = null
      })
    }

    await connectionPromise
    next()
  } catch (error) {
    const message = String(error.message)
    const safeMessage = env.mongoUri
      ? message.replaceAll(env.mongoUri, '[redacted]')
      : message

    console.error(`[db] Request-time connection failed: ${safeMessage}`)

    res.status(503).json({
      success: false,
      message: 'The API cannot reach the database right now.',
    })
  }
}
