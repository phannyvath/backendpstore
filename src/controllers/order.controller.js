import * as orderService from '../services/order.service.js'
import { success, error } from '../utils/response.js'

export async function getMyOrders(req, res) {
  try {
    const orders = await orderService.getMyOrders(req.user.id)
    return success(res, orders)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch orders', 500)
  }
}

export async function getAllOrders(req, res) {
  try {
    const orders = await orderService.getAllOrders()
    return success(res, orders)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch orders', 500)
  }
}

export async function getById(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.id)
    if (!order) return error(res, 'Order not found', 404)
    return success(res, order)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch order', 500)
  }
}

export async function create(req, res) {
  try {
    const { items, phone, socialMedia } = req.body
    if (!Array.isArray(items) || items.length === 0) return error(res, 'Items array required', 400)
    if (!phone || !phone.trim()) return error(res, 'Phone number is required', 400)
    if (!socialMedia || !Array.isArray(socialMedia) || socialMedia.length === 0) {
      return error(res, 'At least one social media link is required', 400)
    }
    const order = await orderService.createOrder(req.user.id, items, { phone, socialMedia })
    if (!order) return error(res, 'Invalid items', 400)
    return success(res, order, 201)
  } catch (e) {
    return error(res, e.message || 'Failed to create order', 500)
  }
}

export async function updateStatus(req, res) {
  try {
    const { status } = req.body
    if (!status) return error(res, 'Status required', 400)
    const order = await orderService.updateOrderStatus(req.params.id, status)
    if (!order) return error(res, 'Order not found', 404)
    return success(res, order)
  } catch (e) {
    return error(res, e.message || 'Failed to update order status', 500)
  }
}

export async function update(req, res) {
  try {
    const { items, phone, socialMedia } = req.body
    if (!Array.isArray(items) || items.length === 0) return error(res, 'Items array required', 400)
    if (!phone || !phone.trim()) return error(res, 'Phone number is required', 400)
    if (!socialMedia || !Array.isArray(socialMedia) || socialMedia.length === 0) {
      return error(res, 'At least one social media link is required', 400)
    }
    const order = await orderService.updateOrder(req.params.id, req.user.id, req.user.role === 'admin', items, { phone, socialMedia })
    if (!order) return error(res, 'Order not found or cannot be updated', 404)
    return success(res, order)
  } catch (e) {
    return error(res, e.message || 'Failed to update order', 500)
  }
}

export async function remove(req, res) {
  try {
    const deleted = await orderService.removeOrder(req.params.id, req.user.id, req.user.role === 'admin')
    if (!deleted) return error(res, 'Order not found or cannot be deleted', 404)
    return success(res, { deleted: true })
  } catch (e) {
    return error(res, e.message || 'Failed to delete order', 500)
  }
}

export async function removePermanent(req, res) {
  try {
    const deleted = await orderService.removeOrderPermanent(req.params.id)
    if (!deleted) return error(res, 'Order not found', 404)
    return success(res, { deleted: true })
  } catch (e) {
    return error(res, e.message || 'Failed to delete order', 500)
  }
}

export async function getReceipt(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.id)
    if (!order) return error(res, 'Order not found', 404)
    if (order.status !== 'delivered') return error(res, 'Receipt only available for delivered orders', 400)
    if (req.user.role !== 'admin' && order.userId !== req.user.id) return error(res, 'Unauthorized', 403)
    // Get admin name if available
    const adminName = req.user.name || 'Admin'
    const html = orderService.generateReceipt(order, adminName)
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.id.slice(0, 8)}.html"`)
    res.send(html)
  } catch (e) {
    return error(res, e.message || 'Failed to generate receipt', 500)
  }
}
