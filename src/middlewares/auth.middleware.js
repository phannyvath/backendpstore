import { verifyToken } from '../utils/token.js'
import { error } from '../utils/response.js'
import * as userRepo from '../repositories/user.repository.js'

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return error(res, 'Authentication required', 401)
    const payload = verifyToken(token)
    if (!payload) return error(res, 'Invalid or expired token', 401)
    
    // Fetch user from database to get name
    const user = await userRepo.findById(payload.id)
    if (!user) return error(res, 'User not found', 401)
    
    req.user = { id: user.id, role: user.role, name: user.name }
    next()
  } catch (e) {
    return error(res, 'Authentication failed', 401)
  }
}
