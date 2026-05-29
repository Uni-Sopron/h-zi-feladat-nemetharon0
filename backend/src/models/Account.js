import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  type:     { type: String, required: true },   // Készpénz, Bankszámla, stb.
  currency: { type: String, required: true },
  balance:  { type: Number, default: 0 },
  color:    { type: String, default: '#f1f5f9' },
}, { timestamps: true })

export default mongoose.model('Account', accountSchema)