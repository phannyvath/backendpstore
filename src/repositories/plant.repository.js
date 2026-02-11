import { Plant } from '../database/index.js'

export async function findAll() {
  const plants = await Plant.find({})
  return plants.map(p => p.toJSON())
}

export async function findById(id) {
  try {
    const plant = await Plant.findById(id)
    return plant ? plant.toJSON() : null
  } catch {
    return null
  }
}

export async function create(plantData) {
  const plant = new Plant(plantData)
  const saved = await plant.save()
  return saved.toJSON()
}

export async function update(id, data) {
  try {
    const plant = await Plant.findByIdAndUpdate(id, data, { new: true })
    return plant ? plant.toJSON() : null
  } catch {
    return null
  }
}

export async function remove(id) {
  try {
    await Plant.findByIdAndDelete(id)
    return true
  } catch {
    return false
  }
}
