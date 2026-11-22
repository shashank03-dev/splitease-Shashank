import { Router } from 'express'
import { getDatabaseStatus } from '../config/db.js'
import { env } from '../config/env.js'

const router = Router()

router.get('/', (req, res) => {
  const database = getDatabaseStatus()
  const isHealthy = database === 'connected'

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'ok' : 'degraded',
    service: 'splitease-api',
    message: isHealthy
      ? 'SplitEasy API is running.'
      : 'SplitEasy API is running, but the database is not connected.',
    environment: env.nodeEnv,
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
    database,
  })
})

export default router
