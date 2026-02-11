import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')

function getPath(filename) {
  return path.join(dataDir, filename)
}

export function readJson(filename) {
  const filePath = getPath(filename)
  if (!fs.existsSync(filePath)) return []
  const raw = fs.readFileSync(filePath, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeJson(filename, data) {
  const filePath = getPath(filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export const db = {
  users: () => readJson('users.json'),
  plants: () => readJson('plants.json'),
  orders: () => readJson('orders.json'),
  blockedUsers: () => readJson('blocked-users.json'),
  saveUsers: (data) => writeJson('users.json', data),
  savePlants: (data) => writeJson('plants.json', data),
  saveOrders: (data) => writeJson('orders.json', data),
  saveBlockedUsers: (data) => writeJson('blocked-users.json', data),
}
