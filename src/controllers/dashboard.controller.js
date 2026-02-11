import * as dashboardService from '../services/dashboard.service.js'
import { success, error } from '../utils/response.js'

export async function getStats(req, res) {
  try {
    const stats = await dashboardService.getDashboardStats()
    return success(res, stats)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch dashboard stats', 500)
  }
}
