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
  if (!admin) return { success: false, message: 'Admin user not found' }
  if (admin.role !== 'admin') return { success: false, message: 'Unauthorized - admin access required' }
  
  // Prevent admin from deleting themselves
  if (userId === adminId) {
    return { success: false, message: 'You cannot delete your own account' }
  }
  
  // Trim password to handle any whitespace issues
  const trimmedPassword = String(adminPassword || '').trim()
  if (!trimmedPassword) return { success: false, message: 'Password is required' }
  
  // Verify admin has a password hash
  if (!admin.password || typeof admin.password !== 'string') {
    console.error('Admin user has invalid password hash:', admin.email)
    return { success: false, message: 'Admin account error - password verification failed' }
  }
  
  // Compare password
  try {
    const isValid = await comparePassword(trimmedPassword, admin.password)
    if (!isValid) {
      return { success: false, message: 'Invalid password. Please verify you are entering the correct password for your admin account.' }
    }
  } catch (error) {
    console.error('Password comparison error:', error)
    return { success: false, message: 'Password verification failed. Please try again.' }
  }
  
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
