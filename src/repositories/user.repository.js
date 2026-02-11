import { User, BlockedUser } from '../database/index.js'

export async function findByEmail(email) {
  const user = await User.findOne({ email: email.toLowerCase() })
  return user ? user.toJSON() : null
}

export async function findById(id) {
  try {
    const user = await User.findById(id)
    return user ? user.toJSON() : null
  } catch {
    return null
  }
}

export async function findAll() {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

export async function create(userData) {
  const user = new User({
    ...userData,
    email: userData.email.toLowerCase(),
  })
  const saved = await user.save()
  return saved.toJSON()
}

export async function update(id, data) {
  try {
    const user = await User.findByIdAndUpdate(id, data, { new: true })
    return user ? user.toJSON() : null
  } catch {
    return null
  }
}

export async function remove(id) {
  try {
    await User.findByIdAndDelete(id)
    return true
  } catch {
    return false
  }
}

// Blocked users repository functions
export async function findBlockedByEmail(email) {
  const blocked = await BlockedUser.findOne({ email: email.toLowerCase() })
  return blocked ? blocked.toJSON() : null
}

export async function findAllBlocked() {
  const blocked = await BlockedUser.find({})
  return blocked.map(b => b.toJSON())
}

export async function blockUser(email, reason, blockedBy) {
  await BlockedUser.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      email: email.toLowerCase(),
      reason: reason || '',
      blockedBy,
      blockedAt: new Date(),
    },
    { upsert: true, new: true }
  )
  return true
}

export async function unblockUser(email) {
  await BlockedUser.findOneAndDelete({ email: email.toLowerCase() })
  return true
}
