import { Router } from 'express'
import * as orderController from '../controllers/order.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { adminOnly } from '../middlewares/role.middleware.js'

const router = Router()

router.get('/', auth, orderController.getMyOrders)
router.get('/all', auth, adminOnly, orderController.getAllOrders)
router.get('/:id', auth, orderController.getById)
router.get('/:id/receipt', auth, orderController.getReceipt)
router.post('/', auth, orderController.create)
router.put('/:id', auth, orderController.update)
router.delete('/:id', auth, orderController.remove)
router.delete('/:id/permanent', auth, adminOnly, orderController.removePermanent)
router.patch('/:id/status', auth, adminOnly, orderController.updateStatus)

export default router
