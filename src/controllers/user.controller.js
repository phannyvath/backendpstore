import * as userService from '../services/user.service.js'
import * as userRepo from '../repositories/user.repository.js'
import { success, error } from '../utils/response.js'

export async function list(req, res) {
  try {
    const users = await userService.getAllUsers()
    const blocked = await userRepo.findAllBlocked()
    // Add blocked status to users
    const usersWithBlocked = users.map((user) => {
      const blockedInfo = blocked.find((b) => b.email.toLowerCase() === user.email.toLowerCase())
      return {
        ...user,
        isBlocked: !!blockedInfo,
        blockedReason: blockedInfo?.reason || null,
        blockedAt: blockedInfo?.blockedAt || null,
      }
    })
    return success(res, usersWithBlocked)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch users', 500)
  }
}

export async function block(req, res) {
  const { email, reason } = req.body
  if (!email) return error(res, 'Email is required', 400)
  const result = await userService.blockUser(email, reason || '', req.user.id)
  if (!result.success) return error(res, result.message, 400)
  return success(res, { blocked: true })
}

export async function unblock(req, res) {
  const { email } = req.body
  if (!email) return error(res, 'Email is required', 400)
  const result = await userService.unblockUser(email)
  if (!result.success) return error(res, result.message, 400)
  return success(res, { unblocked: true })
}

export async function remove(req, res) {
  const { password } = req.body
  if (!password) return error(res, 'Password is required for confirmation', 400)
  const result = await userService.deleteUser(req.params.id, req.user.id, password)
  if (!result.success) return error(res, result.message, 400)
  return success(res, { deleted: true })
}

export async function createByAdmin(req, res) {
  const { email, password, name, role } = req.body
  if (!email || !password) return error(res, 'Email and password are required', 400)
  if (role && !['admin', 'client'].includes(role)) {
    return error(res, 'Role must be "admin" or "client"', 400)
  }
  const result = await userService.createUserByAdmin(email, password, name, role || 'client', req.user.id)
  if (!result.success) return error(res, result.message, 400)
  return success(res, result.user, 201)
}
