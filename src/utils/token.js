import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/jwt.js'

export function signToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, jwtConfig.secret)
  } catch {
    return null
  }
}
