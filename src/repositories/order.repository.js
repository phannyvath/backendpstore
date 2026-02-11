import { Order } from '../database/index.js'

export async function findAll() {
  const orders = await Order.find({}).sort({ createdAt: -1 })
  return orders.map(o => o.toJSON())
}

export async function findById(id) {
  try {
    const order = await Order.findById(id)
    return order ? order.toJSON() : null
  } catch {
    return null
  }
}

export async function findByUserId(userId) {
  const orders = await Order.find({ userId, deletedByUser: { $ne: true } }).sort({ createdAt: -1 })
  return orders.map(o => o.toJSON())
}

export async function create(orderData) {
  const order = new Order(orderData)
  const saved = await order.save()
  return saved.toJSON()
}

export async function update(id, data) {
  try {
    // Handle phone/socialMedia deletion explicitly
    const updateData = { ...data }
    if ('phone' in data && (data.phone === undefined || data.phone === null)) {
      updateData.$unset = { phone: '' }
      delete updateData.phone
    }
    if ('socialMedia' in data && (data.socialMedia === undefined || data.socialMedia === null)) {
      if (!updateData.$unset) updateData.$unset = {}
      updateData.$unset.socialMedia = ''
      delete updateData.socialMedia
    }
    
    const order = await Order.findByIdAndUpdate(id, updateData, { new: true })
    return order ? order.toJSON() : null
  } catch {
    return null
  }
}

export async function remove(id) {
  try {
    await Order.findByIdAndDelete(id)
    return true
  } catch {
    return false
  }
}
