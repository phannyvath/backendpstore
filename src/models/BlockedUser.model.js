import mongoose from 'mongoose'

const blockedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  reason: {
    type: String,
    default: '',
  },
  blockedBy: {
    type: String,
    required: true,
  },
  blockedAt: {
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

export const BlockedUser = mongoose.model('BlockedUser', blockedUserSchema)
