import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env, validateEnv } from './config/env.js'

let httpServer

async function startServer() {
  validateEnv()
  await connectDB(env.mongoUri)

  httpServer = app.listen(env.port)

  await new Promise((resolve, reject) => {
    httpServer.once('listening', resolve)
    httpServer.once('error', reject)
  })

  console.log(
    `[server] SplitEasy API listening on http://localhost:${env.port}`,
  )
  console.log(`[server] Health check: http://localhost:${env.port}/api/health`)
  console.log(`[server] Environment: ${env.nodeEnv}`)
  console.log(`[server] CORS origins: ${env.clientOrigins.join(', ')}`)
}

async function shutdown(signal) {
  console.log(`\n[server] ${signal} received. Shutting down...`)

  if (!httpServer) {
    await disconnectDB()
    process.exit(0)
  }

  httpServer.close(async (error) => {
    if (error) {
      console.error('[server] Error while closing the HTTP server:', error)
      process.exitCode = 1
    }

    await disconnectDB()
    process.exit()
  })

  // Do not hang forever if an open connection refuses to close.
  setTimeout(() => {
    console.error('[server] Shutdown timed out after 10 seconds.')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

startServer().catch((error) => {
  console.error(`[server] Failed to start: ${error.message}`)
  process.exit(1)
})
