import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as plantRepo from '../repositories/plant.repository.js'
import { v4 as uuidv4 } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads')

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

function savePlantImage(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') return null
  
  // If it's already a URL (starts with http:// or https://), return as is
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data
  }
  
  // If it's base64 data URL, save it
  const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) return null
  
  ensureUploadsDir()
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const filename = `plant-${uuidv4()}.${ext}`
  const filepath = path.join(UPLOADS_DIR, filename)
  fs.writeFileSync(filepath, Buffer.from(match[2], 'base64'))
  return `/uploads/${filename}`
}

export async function getAll() {
  return await plantRepo.findAll()
}

export async function getById(id) {
  return await plantRepo.findById(id)
}

export async function create(data) {
  // Process image: if it's base64, save it; if it's URL, keep it
  const imageUrl = data.image ? savePlantImage(data.image) : ''
  
  const plant = {
    name: data.name,
    category: data.category || 'Indoor',
    price: Number(data.price),
    image: imageUrl || '',
    care: data.care || { water: '', sunlight: '', level: 'Easy' },
    description: data.description || '',
  }
  return await plantRepo.create(plant)
}

export async function update(id, data) {
  // Process image: if it's base64, save it; if it's URL, keep it
  // If image is provided, process it; otherwise keep existing
  const updateData = { ...data }
  if (data.image !== undefined) {
    updateData.image = data.image ? savePlantImage(data.image) : ''
  }
  return await plantRepo.update(id, updateData)
}

export async function remove(id) {
  return await plantRepo.remove(id)
}
