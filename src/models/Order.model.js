import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  plantId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  name: {
    type: String,
    required: true,
  },
}, { _id: false })

const socialMediaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: null,
  },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered'],
    default: 'pending',
  },
  phone: {
    type: String,
    default: null,
  },
  socialMedia: {
    type: [socialMediaSchema],
    default: [],
  },
  deletedByUser: {
    type: Boolean,
    default: false,
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

export const Order = mongoose.model('Order', orderSchema)
