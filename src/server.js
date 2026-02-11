import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './database/mongodb.js'

// Start server immediately (don't wait for MongoDB)
// This prevents Render deployment timeouts
const port = process.env.PORT || env.port

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Plant Store API running on port ${port}`)
  console.log(`📍 Health check: http://localhost:${port}/api`)
  
  // Connect to MongoDB in the background (non-blocking)
  // This allows the server to start even if MongoDB connection takes time
  connectDB().catch((error) => {
    console.error('⚠️ MongoDB connection failed (will retry):', error.message)
    console.error('💡 The server is running but database operations will fail until MongoDB connects.')
    console.error('💡 Check your MONGODB_URI environment variable in Render.')
  })
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
