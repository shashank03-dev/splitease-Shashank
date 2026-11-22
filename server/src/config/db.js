import mongoose from 'mongoose'

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

let listenersRegistered = false
let hasConnected = false

function registerConnectionListeners() {
  if (listenersRegistered) {
    return
  }

  listenersRegistered = true

  mongoose.connection.on('error', (error) => {
    console.error(`[db] MongoDB connection error: ${error.message}`)
  })

  mongoose.connection.on('disconnected', () => {
    // A failed initial connection also emits "disconnected"; only warn once a
    // real connection has been established and later drops.
    if (hasConnected) {
      console.warn('[db] MongoDB disconnected.')
    }
  })
}

export function getDatabaseStatus() {
  return READY_STATES[mongoose.connection.readyState] ?? 'unknown'
}

/**
 * Connect to MongoDB and reject on failure so the caller can stop the process.
 * The URI is never logged, and it is scrubbed from driver error messages.
 */
export async function connectDB(uri) {
  registerConnectionListeners()

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
    })

    hasConnected = true
    console.log(`[db] MongoDB connected: ${connection.connection.name}`)
    return connection
  } catch (error) {
    const safeMessage = String(error.message).replaceAll(uri, '[redacted]')
    console.error(`[db] MongoDB connection failed: ${safeMessage}`)
    throw error
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) {
    return
  }

  // Mark the connection as intentional before closing so the "disconnected"
  // listener does not report a normal shutdown as an unexpected failure.
  hasConnected = false
  await mongoose.disconnect()
  console.log('[db] MongoDB connection closed.')
}
