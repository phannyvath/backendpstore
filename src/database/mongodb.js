import mongoose from 'mongoose'
import { env } from '../config/env.js'

let isConnected = false

export async function connectDB() {
  if (isConnected) {
    return
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      // Retry connection automatically
      retryWrites: true,
      w: 'majority',
    }
    
    console.log('🔄 Connecting to MongoDB...')
    const uri = env.mongodb.uri
    if (!uri || uri === 'mongodb://localhost:27017/plant-store') {
      console.warn('⚠️ Using default MongoDB URI. Set MONGODB_URI environment variable in Render!')
    }
    console.log('📍 Connection URI:', uri.replace(/:[^:@]+@/, ':****@')) // Hide password in logs
    
    await mongoose.connect(uri, options)
    isConnected = true
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('\n💡 Troubleshooting tips:')
    console.error('1. Check if your IP address is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for all IPs)')
    console.error('2. Verify your MONGODB_URI environment variable is set correctly in Render')
    console.error('3. Check if your password has special characters that need URL encoding')
    console.error('4. Ensure your MongoDB Atlas cluster is running')
    console.error('5. The server will continue running - MongoDB will reconnect automatically\n')
    // Don't throw - let server continue running
    // The connection will be retried automatically by Mongoose
    throw error
  }
}

export async function disconnectDB() {
  if (!isConnected) return
  await mongoose.disconnect()
  isConnected = false
  console.log('MongoDB disconnected')
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err)
})

mongoose.connection.on('disconnected', () => {
  isConnected = false
  console.log('MongoDB disconnected')
})

export default mongoose
