import * as userRepo from '../repositories/user.repository.js'
import { comparePassword } from '../utils/password.js'
import { signToken } from '../utils/token.js'
import { hashPassword } from '../utils/password.js'

export async function login(email, password) {
  const user = await userRepo.findByEmail(email)
  if (!user) return { success: false, message: 'Invalid email or password' }
  
  // Check if email is blocked
  const blocked = await userRepo.findBlockedByEmail(email)
  if (blocked) {
    return { success: false, message: 'This email has been blocked' }
  }
  
  const ok = await comparePassword(password, user.password)
  if (!ok) return { success: false, message: 'Invalid email or password' }
  const token = signToken({ id: user.id, role: user.role })
  return {
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  }
}

export async function register(email, password, name) {
  // Check if email is blocked
  const blocked = await userRepo.findBlockedByEmail(email)
  if (blocked) {
    return { success: false, message: 'This email has been blocked and cannot register' }
  }
  
  const existing = await userRepo.findByEmail(email)
  if (existing) return { success: false, message: 'Email already registered' }
  
  const hashed = await hashPassword(password)
  const user = await userRepo.create({
    email: email.trim().toLowerCase(),
    password: hashed,
    role: 'client',
    name: (name || email).trim(),
  })
  const token = signToken({ id: user.id, role: user.role })
  return {
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  }
}

export async function getProfile(userId) {
  const user = await userRepo.findById(userId)
  if (!user) return null
  return { id: user.id, email: user.email, role: user.role, name: user.name }
}
