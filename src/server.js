import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './database/mongodb.js'

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB()
    
    // Start server
    app.listen(env.port, () => {
      console.log(`Plant Store API running at http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
