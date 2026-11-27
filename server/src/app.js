import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { ensureDatabase } from './middleware/ensureDatabase.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import expenseRoutes from './routes/expense.routes.js'
import healthRoutes from './routes/health.routes.js'
import personRoutes from './routes/person.routes.js'

const app = express()

// Do not advertise the framework in response headers.
app.disable('x-powered-by')

const corsOptions = {
  origin(origin, callback) {
    // Requests from curl, Postman or server-to-server calls have no Origin.
    if (!origin || env.clientOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    const error = new Error(`Origin ${origin} is not allowed by CORS.`)
    error.status = 403
    callback(error)
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// Order matters: CORS and body parsing run before any route, and the database
// check runs before any handler that reads or writes data.
app.use(cors(corsOptions))
app.use(express.json({ limit: '10kb' }))
app.use(ensureDatabase)

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SplitEasy API',
    health: '/api/health',
    expenses: '/api/expenses',
    people: '/api/people',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/people', personRoutes)

// Unknown routes and thrown errors are handled in one place.
app.use(notFound)
app.use(errorHandler)

export default app
