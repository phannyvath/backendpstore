import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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

export const User = mongoose.model('User', userSchema)
