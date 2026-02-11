import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { auth } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/me', auth, authController.me)

export default router
