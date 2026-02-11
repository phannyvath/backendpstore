import * as orderRepo from '../repositories/order.repository.js'
import * as userRepo from '../repositories/user.repository.js'
import * as plantRepo from '../repositories/plant.repository.js'

export async function getDashboardStats() {
  const orders = await orderRepo.findAll()
  const users = await userRepo.findAll()
  const plants = await plantRepo.findAll()
  
  // Calculate total revenue (sum of all order totals)
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (Number(order.total) || 0)
  }, 0)
  
  // Count orders by status
  const ordersByStatus = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }
  
  // Count users by role
  const usersByRole = {
    admin: users.filter((u) => u.role === 'admin').length,
    client: users.filter((u) => u.role === 'client').length,
  }
  
  // Count blocked users
  const blockedUsersList = await userRepo.findAllBlocked()
  const blockedUsers = blockedUsersList.length
  
  // Recent activity (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt)
    return orderDate >= weekAgo
  }).length
  
  return {
    // Sales metrics
    totalSales: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    
    // Order status breakdown
    ordersPending: ordersByStatus.pending,
    ordersConfirmed: ordersByStatus.confirmed,
    ordersShipped: ordersByStatus.shipped,
    ordersDelivered: ordersByStatus.delivered,
    
    // User metrics
    totalUsers: users.length,
    adminUsers: usersByRole.admin,
    clientUsers: usersByRole.client,
    blockedUsers,
    
    // Product metrics
    totalPlants: plants.length,
    
    // Recent activity
    recentOrders,
  }
}
