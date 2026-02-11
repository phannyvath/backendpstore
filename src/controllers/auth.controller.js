import * as authService from '../services/auth.service.js'
import { success, error } from '../utils/response.js'

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return error(res, 'Email and password required', 400)
  const result = await authService.login(email, password)
  if (!result.success) return error(res, result.message, 401)
  return success(res, { token: result.token, user: result.user })
}

export async function register(req, res) {
  const { email, password, name } = req.body
  if (!email || !password) return error(res, 'Email and password required', 400)
  const result = await authService.register(email, password, name)
  if (!result.success) return error(res, result.message, 400)
  return success(res, { token: result.token, user: result.user }, 201)
}

export async function me(req, res) {
  try {
    const user = await authService.getProfile(req.user.id)
    if (!user) return error(res, 'User not found', 404)
    return success(res, user)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch user profile', 500)
  }
}
