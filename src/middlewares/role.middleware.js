import { error } from '../utils/response.js'

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return error(res, 'Admin access required', 403)
  next()
}
