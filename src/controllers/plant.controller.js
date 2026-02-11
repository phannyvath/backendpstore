import * as plantService from '../services/plant.service.js'
import { success, error } from '../utils/response.js'

export async function getAll(req, res) {
  try {
    const plants = await plantService.getAll()
    return success(res, plants)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch plants', 500)
  }
}

export async function getById(req, res) {
  try {
    const plant = await plantService.getById(req.params.id)
    if (!plant) return error(res, 'Plant not found', 404)
    return success(res, plant)
  } catch (e) {
    return error(res, e.message || 'Failed to fetch plant', 500)
  }
}

export async function create(req, res) {
  try {
    const plant = await plantService.create(req.body)
    return success(res, plant, 201)
  } catch (e) {
    return error(res, e.message || 'Failed to create plant', 500)
  }
}

export async function update(req, res) {
  try {
    const plant = await plantService.update(req.params.id, req.body)
    if (!plant) return error(res, 'Plant not found', 404)
    return success(res, plant)
  } catch (e) {
    return error(res, e.message || 'Failed to update plant', 500)
  }
}

export async function remove(req, res) {
  try {
    await plantService.remove(req.params.id)
    return success(res, { deleted: true })
  } catch (e) {
    return error(res, e.message || 'Failed to delete plant', 500)
  }
}
