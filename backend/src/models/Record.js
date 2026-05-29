import mongoose from 'mongoose'

const recordSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type:      { type: String, enum: ['income', 'expense'], required: true },
  category:  { type: String, required: true },
  amount:    { type: Number, required: true },
  note:      { type: String, default: '' },
  party:     { type: String, default: '' },
  date:      { type: String, required: true },  // "YYYY-MM-DD" string
  attachment:{ type: String, default: null },   // TODO
}, { timestamps: true })

export default mongoose.model('Record', recordSchema)