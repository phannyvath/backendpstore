import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/plant-store',
  },
}
