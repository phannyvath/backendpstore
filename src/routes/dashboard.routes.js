import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { adminOnly } from '../middlewares/role.middleware.js'

const router = Router()
router.get('/stats', auth, adminOnly, dashboardController.getStats)
export default router
