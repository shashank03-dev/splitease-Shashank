import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const envFilePath = path.resolve(currentDirectory, '../../.env')

// Load server/.env explicitly so the server behaves the same whether it is
// started from the repository root or from inside server/.
const { error: dotenvError } = dotenv.config({
  path: envFilePath,
  quiet: true,
})

if (dotenvError && dotenvError.code !== 'ENOENT') {
  throw new Error(
    `Could not load environment variables from ${envFilePath}: ${dotenvError.message}`,
  )
}

function parsePort(rawPort) {
  if (rawPort === undefined || rawPort.trim() === '') {
    return 5000
  }

  const port = Number(rawPort)
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : Number.NaN
}

function parseOrigins(rawOrigins) {
  return (rawOrigins?.trim() || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: parsePort(process.env.PORT),
  mongoUri: process.env.MONGO_URI?.trim() || '',
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
})

/**
 * Fail fast with an actionable message instead of letting Mongoose or Express
 * throw a cryptic error later in the startup sequence.
 */
export function validateEnv() {
  const problems = []

  if (!env.mongoUri) {
    problems.push('MONGO_URI is missing.')
  } else if (!/^mongodb(\+srv)?:\/\//.test(env.mongoUri)) {
    problems.push('MONGO_URI must start with mongodb:// or mongodb+srv://.')
  }

  if (!Number.isInteger(env.port)) {
    problems.push('PORT must be a whole number between 1 and 65535.')
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n- ${problems.join('\n- ')}\n` +
        'Copy server/.env.example to server/.env and fill in the values.',
    )
  }
}
