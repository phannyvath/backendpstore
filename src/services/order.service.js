import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as orderRepo from '../repositories/order.repository.js'
import * as plantRepo from '../repositories/plant.repository.js'
import * as userRepo from '../repositories/user.repository.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads')

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

function saveSocialImage(orderId, index, base64Data) {
  if (!base64Data || typeof base64Data !== 'string') return null
  const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) return null
  ensureUploadsDir()
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const filename = `${orderId}-social-${index}.${ext}`
  const filepath = path.join(UPLOADS_DIR, filename)
  fs.writeFileSync(filepath, Buffer.from(match[2], 'base64'))
  return `/uploads/${filename}`
}

export async function getMyOrders(userId) {
  const orders = await orderRepo.findByUserId(userId)
  return await enrichOrdersWithUserInfo(orders)
}

export async function getAllOrders() {
  const orders = await orderRepo.findAll()
  return await enrichOrdersWithUserInfo(orders)
}

export async function getOrderById(id) {
  const order = await orderRepo.findById(id)
  if (!order) return null
  const enriched = await enrichOrdersWithUserInfo([order])
  return enriched[0] || null
}

async function enrichOrdersWithUserInfo(orders) {
  const enriched = await Promise.all(
    orders.map(async (order) => {
      const user = await userRepo.findById(order.userId)
      return {
        ...order,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || '',
      }
    })
  )
  return enriched
}

export async function createOrder(userId, items, options = {}) {
  const { phone, socialMedia } = options
  const plants = await plantRepo.findAll()
  const orderItems = []
  let total = 0
  for (const { plantId, quantity } of items) {
    const plant = plants.find((p) => p.id === plantId)
    if (!plant || quantity < 1) continue
    const price = plant.price
    orderItems.push({ plantId, quantity, price, name: plant.name })
    total += price * quantity
  }
  if (orderItems.length === 0) return null
  
  // Create order first to get the ID
  const order = {
    userId,
    items: orderItems,
    total: Math.round(total * 100) / 100,
    status: 'pending',
    phone: String(phone).trim(),
    socialMedia: [],
  }
  
  const savedOrder = await orderRepo.create(order)
  if (!savedOrder) return null
  
  // Process social media images with actual order ID
  let processedSocial = []
  if (Array.isArray(socialMedia) && socialMedia.length > 0) {
    processedSocial = await Promise.all(
      socialMedia.slice(0, 2).map(async (s, i) => {
        const { type, link, image } = s || {}
        const imageUrl = image ? saveSocialImage(savedOrder.id, i, image) : null
        return { type: type || 'facebook', link: link || '', imageUrl: imageUrl || null }
      })
    )
    // Update order with processed social media
    return await orderRepo.update(savedOrder.id, { socialMedia: processedSocial })
  }
  
  return savedOrder
}

export async function updateOrderStatus(id, status) {
  return await orderRepo.update(id, { status })
}

export async function updateOrder(id, userId, isAdmin, items, options = {}) {
  const order = await orderRepo.findById(id)
  if (!order) return null
  if (order.status !== 'pending') return null
  if (!isAdmin && order.userId !== userId) return null
  const { phone, socialMedia } = options
  const plants = await plantRepo.findAll()
  const orderItems = []
  let total = 0
  for (const { plantId, quantity } of items) {
    const plant = plants.find((p) => p.id === plantId)
    if (!plant || quantity < 1) continue
    const price = plant.price
    orderItems.push({ plantId, quantity, price, name: plant.name })
    total += price * quantity
  }
  if (orderItems.length === 0) return null
  let processedSocial = []
  const existingSocial = order.socialMedia || []
  if (Array.isArray(socialMedia) && socialMedia.length > 0) {
    processedSocial = await Promise.all(
      socialMedia.slice(0, 2).map(async (s, i) => {
        const { type, link, image } = s || {}
        const existing = existingSocial[i]
        const imageUrl = image ? saveSocialImage(id, i, image) : (existing?.imageUrl || null)
        return { type: type || 'facebook', link: link || '', imageUrl: imageUrl || null }
      })
    )
  }
  const updateData = {
    items: orderItems,
    total: Math.round(total * 100) / 100,
    phone: String(phone).trim(),
    socialMedia: processedSocial,
  }
  return await orderRepo.update(id, updateData)
}

export async function removeOrder(id, userId, isAdmin) {
  const order = await orderRepo.findById(id)
  if (!order) return null
  if (!isAdmin && order.userId !== userId) return null
  if (isAdmin) {
    return await orderRepo.remove(id)
  } else {
    if (order.status === 'pending') {
      return await orderRepo.remove(id)
    } else if (order.status === 'delivered') {
      return await orderRepo.update(id, { deletedByUser: true })
    }
  }
  return null
}

export async function removeOrderPermanent(id) {
  return await orderRepo.remove(id)
}

export function generateReceipt(order, adminName = 'Admin') {
  if (!order) return null
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const userName = order.userName || 'Customer'
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px 0; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
      <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">$${Number(item.price).toFixed(2)}</td>
      <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('')
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - Order #${order.id.slice(0, 8)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 40px; background: #f6f9f6; color: #1c2822; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(45, 122, 90, 0.1); }
    .logo-section { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
    .logo { display: inline-flex; align-items: center; gap: 12px; }
    .logo-icon { width: 56px; height: 56px; }
    .logo-text { font-family: 'Libre Baskerville', Georgia, serif; font-size: 32px; font-weight: 700; color: #2d7a5a; margin: 0; }
    h1 { color: #2d7a5a; margin: 0 0 8px; font-size: 28px; font-weight: 600; }
    .subtitle { color: #666; margin: 0 0 32px; font-size: 14px; }
    .section { margin: 24px 0; }
    .section-title { font-weight: 600; color: #2d7a5a; margin-bottom: 12px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { text-align: left; padding: 12px 0; border-bottom: 2px solid #2d7a5a; color: #2d7a5a; font-weight: 600; font-size: 14px; }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
    td { font-size: 14px; }
    .total-row { font-weight: 600; font-size: 18px; color: #2d7a5a; }
    .total-row td { padding-top: 16px; border-top: 2px solid #e5e7eb; }
    .info { font-size: 14px; line-height: 1.6; color: #444; }
    .info-item { margin: 8px 0; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #2d7a5a; color: white; font-size: 12px; font-weight: 500; }
    @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="logo-section">
      <div class="logo">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2d7a5a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        <h1 class="logo-text">Forest Plant Store</h1>
      </div>
    </div>
    <p class="subtitle" style="text-align: center; margin-top: 0;">Receipt</p>
    <div class="section">
      <div class="info">
        <div class="info-item"><strong>Order ID:</strong> #${order.id.slice(0, 8)}</div>
        <div class="info-item"><strong>Date:</strong> ${date}</div>
        <div class="info-item"><strong>Status:</strong> <span class="status">${order.status}</span></div>
        <div class="info-item"><strong>Customer:</strong> ${userName}</div>
        <div class="info-item"><strong>Processed by:</strong> ${adminName}</div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Items</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="3" style="text-align: right; padding-right: 16px;">Total</td>
            <td style="text-align: right;">$${Number(order.total).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ${order.phone || (order.socialMedia && order.socialMedia.length) ? `
    <div class="section">
      <div class="section-title">Contact Information</div>
      <div class="info">
        ${order.phone ? `<div class="info-item"><strong>Phone:</strong> ${order.phone}</div>` : ''}
        ${order.socialMedia && order.socialMedia.length ? order.socialMedia.map(s => `<div class="info-item"><strong>${s.type.charAt(0).toUpperCase() + s.type.slice(1)}:</strong> ${s.link}</div>`).join('') : ''}
      </div>
    </div>
    ` : ''}
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
      Thank you for your order!
    </div>
  </div>
</body>
</html>`
  return html
}
