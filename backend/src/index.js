import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import api from './routes/api.js'
import authRoutes from './routes/auth.js'
import accountRoutes from './routes/accounts.js'
import recordRoutes from './routes/records.js'

dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', api)
app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/records', recordRoutes)

const { DB_USER, DB_PASSWORD, DB_URL, DB_NAME, PORT } = process.env

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}?retryWrites=true&w=majority`,
  { dbName: DB_NAME }
)
.then(() => console.info('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err))

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

app.listen(PORT, () => console.info(`Server listening on localhost:${PORT}`))