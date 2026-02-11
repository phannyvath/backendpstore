import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { adminOnly } from '../middlewares/role.middleware.js'

const router = Router()
router.get('/', auth, adminOnly, userController.list)
router.post('/block', auth, adminOnly, userController.block)
router.post('/unblock', auth, adminOnly, userController.unblock)
router.delete('/:id', auth, adminOnly, userController.remove)
router.post('/:id/delete', auth, adminOnly, userController.remove) // Alternative route using POST
router.post('/create', auth, adminOnly, userController.createByAdmin)
export default router
