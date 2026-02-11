import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import plantRoutes from './routes/plant.routes.js'
import orderRoutes from './routes/order.routes.js'
import userRoutes from './routes/user.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')
app.use('/uploads', express.static(uploadsDir))

app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(errorHandler)

export default app
