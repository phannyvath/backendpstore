import * as userRepo from '../repositories/user.repository.js'
import { comparePassword, hashPassword } from '../utils/password.js'

export async function getAllUsers() {
  const users = await userRepo.findAll()
  return users.map(({ id, email, role, name }) => ({ id, email, role, name }))
}

export async function blockUser(email, reason, adminId) {
  const user = await userRepo.findByEmail(email)
  if (!user) return { success: false, message: 'User not found' }
  await userRepo.blockUser(email, reason, adminId)
  return { success: true }
}

export async function unblockUser(email) {
  const blocked = await userRepo.findBlockedByEmail(email)
  if (!blocked) return { success: false, message: 'Email is not blocked' }
  await userRepo.unblockUser(email)
  return { success: true }
}

export async function deleteUser(userId, adminId, adminPassword) {
  const user = await userRepo.findById(userId)
  if (!user) return { success: false, message: 'User not found' }
  
  // Verify admin password
  const admin = await userRepo.findById(adminId)
  if (!admin || admin.role !== 'admin') return { success: false, message: 'Unauthorized' }
  
  const isValid = await comparePassword(adminPassword, admin.password)
  if (!isValid) return { success: false, message: 'Invalid password' }
  
  await userRepo.remove(userId)
  return { success: true }
}

export async function isEmailBlocked(email) {
  const blocked = await userRepo.findBlockedByEmail(email)
  return !!blocked
}

export async function createUserByAdmin(email, password, name, role, adminId) {
  const existing = await userRepo.findByEmail(email)
  if (existing) return { success: false, message: 'Email already registered' }
  
  const blocked = await userRepo.findBlockedByEmail(email)
  if (blocked) return { success: false, message: 'Email is blocked' }
  
  const hashed = await hashPassword(password)
  const user = await userRepo.create({
    email: email.trim().toLowerCase(),
    password: hashed,
    role: role || 'client',
    name: (name || email).trim(),
    createdBy: adminId,
  })
  return {
    success: true,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  }
}
