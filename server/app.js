import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import authRoutes from './routes/authRoutes.js'
import billRoutes from './routes/billRoutes.js'
import bootstrapRoutes from './routes/bootstrapRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import walletRoutes from './routes/walletRoutes.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.resolve(__dirname, '../dist')

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use('/api/bootstrap', bootstrapRoutes)
app.use('/api/auth', authRoutes)
app.use('/api', authRoutes)
app.use('/api/bills', billRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/wallet', walletRoutes)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist))
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use((err, _req, res, next) => {
  void next
  const status = /not found/i.test(err.message || '') ? 404 : 400
  res.status(status).json({ message: err.message || 'Server error' })
})

export default app
