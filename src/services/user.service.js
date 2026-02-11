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
    return { 
      success: false, 
      message: `You cannot delete your own account (${admin.email}). Please log in with a different admin account to delete this user.` 
    }
  }
  
  // Verify admin has a password hash
  if (!admin.password || typeof admin.password !== 'string') {
    console.error('Admin user has invalid password hash:', admin.email)
    return { success: false, message: 'Admin account error - password verification failed' }
  }
  
  // Compare password - use EXACT same logic as login
  // Login: comparePassword(password, user.password) where password comes directly from req.body (no trimming)
  // Now frontend also doesn't trim, so we match login exactly
  try {
    if (!adminPassword) return { success: false, message: 'Password is required' }
    
    // Debug: Log comparison attempt (don't log actual password)
    console.log('🔐 Password verification for delete:', {
      adminEmail: admin.email,
      adminId: admin.id,
      targetUserEmail: user.email,
      targetUserId: user.id,
      passwordLength: String(adminPassword).length,
      hasPasswordHash: !!admin.password,
      passwordHashFormat: admin.password?.substring(0, 7), // $2b$10 or similar
    })
    
    // IMPORTANT: Compare against the LOGGED-IN admin's password (nono@gmail.com), not the target user
    // Use EXACT same comparison as login - pass password directly without modification
    const isValid = await comparePassword(adminPassword, admin.password)
    console.log('✅ Password comparison result:', isValid)
    
    if (!isValid) {
      // Additional check: verify the password hash format is correct
      if (!admin.password.startsWith('$2')) {
        console.error('❌ Invalid password hash format for admin:', admin.email)
        return { success: false, message: 'Admin account password error. The password hash is invalid. Please contact support.' }
      }
      
      return { 
        success: false, 
        message: `Invalid password for ${admin.email}. Please enter the password for the account you are currently logged in as (${admin.email}), NOT the password for ${user.email}.` 
      }
    }
  } catch (error) {
    console.error('❌ Password comparison error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      adminEmail: admin.email,
    })
    return { success: false, message: `Password verification failed: ${error.message}` }
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
