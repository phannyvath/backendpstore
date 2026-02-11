import mongoose from 'mongoose'

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  care: {
    water: {
      type: String,
      default: '',
    },
    sunlight: {
      type: String,
      default: '',
    },
    level: {
      type: String,
      default: 'Easy',
    },
  },
}, {
  timestamps: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    },
  },
})

export const Plant = mongoose.model('Plant', plantSchema)
