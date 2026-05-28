import { getCollections } from '../config/db.js'
import { serializeUser } from '../utils/serializers.js'
import crypto from 'node:crypto'

export async function login(req, res, next) {
  try {
    const { users } = await getCollections()
    const { username, password } = req.body

    const user = await users.findOne({ username, password })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    res.json({ user: serializeUser(user) })
  } catch (err) {
    next(err)
  }
}

export async function signup(req, res, next) {
  try {
    const { users } = await getCollections()
    const { username, password, name, address, phone, email } = req.body

    if (!username || !password || !name || !address || !phone || !email) {
      return res.status(400).json({ message: 'Username, password, name, address, phone, and email are required' })
    }

    const existingUser = await users.findOne({ username })
    if (existingUser) {
      return res.status(409).json({ message: 'Username is already taken' })
    }

    const newUser = {
      id: `user-${crypto.randomUUID()}`,
      username,
      password,
      name,
      address,
      phone,
      email,
      role: 'user',
      wallet_balance: 0,
      created_at: new Date(),
    }

    await users.insertOne(newUser)

    res.status(201).json({ user: serializeUser(newUser) })
  } catch (err) {
    next(err)
  }
}
