import { Router } from 'express'
import * as plantController from '../controllers/plant.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { adminOnly } from '../middlewares/role.middleware.js'

const router = Router()

router.get('/', plantController.getAll)
router.get('/:id', plantController.getById)
router.post('/', auth, adminOnly, plantController.create)
router.put('/:id', auth, adminOnly, plantController.update)
router.delete('/:id', auth, adminOnly, plantController.remove)

export default router
