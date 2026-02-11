import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './database/mongodb.js'

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB()
    
    // Start server - use PORT from environment (Render provides this) or default to 3000
    const port = process.env.PORT || env.port
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Plant Store API running on port ${port}`)
      console.log(`📍 Health check: http://localhost:${port}/api`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
