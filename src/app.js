import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.routes.js'
import plantRoutes from './routes/plant.routes.js'
import orderRoutes from './routes/order.routes.js'
import userRoutes from './routes/user.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// CORS configuration - allow all origins for flexibility
// In production, you can restrict to specific domains:
// origin: ['https://your-frontend.vercel.app', 'http://localhost:5173']
app.use(cors({ 
  origin: true, // Allow all origins (you can restrict this in production)
  credentials: true 
}))
// Parse JSON bodies for all request types including DELETE
app.use(express.json({ limit: '10mb' }))
// Also parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')
app.use('/uploads', express.static(uploadsDir))

// Health check endpoint - responds immediately (doesn't wait for DB)
// This is critical for Render deployment - it checks this endpoint to verify deployment success
app.get('/api', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  
  res.json({ 
    status: 'ok', 
    message: 'Plant Store API is running',
    database: dbStatus,
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      plants: '/api/plants',
      orders: '/api/orders',
      users: '/api/users',
      dashboard: '/api/dashboard'
    }
  })
})

// Root health check (for Render)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Plant Store API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(errorHandler)

export default app
