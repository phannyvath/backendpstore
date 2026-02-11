import * as plantRepo from '../repositories/plant.repository.js'

export async function getAll() {
  return await plantRepo.findAll()
}

export async function getById(id) {
  return await plantRepo.findById(id)
}

export async function create(data) {
  const plant = {
    name: data.name,
    category: data.category || 'Indoor',
    price: Number(data.price),
    image: data.image || '',
    care: data.care || { water: '', sunlight: '', level: 'Easy' },
    description: data.description || '',
  }
  return await plantRepo.create(plant)
}

export async function update(id, data) {
  return await plantRepo.update(id, data)
}

export async function remove(id) {
  return await plantRepo.remove(id)
}
