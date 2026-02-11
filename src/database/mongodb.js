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
    }
    
    console.log('🔄 Connecting to MongoDB...')
    console.log('📍 Connection URI:', env.mongodb.uri.replace(/:[^:@]+@/, ':****@')) // Hide password in logs
    await mongoose.connect(env.mongodb.uri, options)
    isConnected = true
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('\n💡 Troubleshooting tips:')
    console.error('1. Check if your IP address is whitelisted in MongoDB Atlas')
    console.error('2. Verify your MongoDB connection string is correct')
    console.error('3. Check if your password has special characters that need URL encoding')
    console.error('4. Ensure your MongoDB Atlas cluster is running\n')
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
