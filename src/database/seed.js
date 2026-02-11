import { hashPassword } from '../utils/password.js'
import { connectDB, User } from './index.js'

async function seed() {
  try {
    await connectDB()
    
    // Check if users already exist
    const existingUsers = await User.countDocuments()
    if (existingUsers > 0) {
      console.log('Database already has users. Skip seed.')
      return
    }
    
    const adminHash = await hashPassword('admin123')
    const clientHash = await hashPassword('client123')
    
    await User.create([
      { email: 'admin@forest.com', password: adminHash, role: 'admin', name: 'Admin' },
      { email: 'client@forest.com', password: clientHash, role: 'client', name: 'Client' },
    ])
    
    console.log('✅ Seeded admin@forest.com / admin123 (admin) and client@forest.com / client123 (client)')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
