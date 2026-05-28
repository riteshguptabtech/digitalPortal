import dotenv from 'dotenv'
import { MongoClient, ServerApiVersion } from 'mongodb'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
const envResult = dotenv.config({ path: envPath })

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'electricity_billing'

function getMongoTarget(value) {
  if (!value) return 'mongodb://127.0.0.1:27017'

  try {
    const url = new URL(value)
    return `${url.protocol}//${url.host}${url.pathname || ''}`
  } catch {
    return 'invalid MongoDB URI'
  }
}

export const client = new MongoClient(uri || 'mongodb://127.0.0.1:27017', {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
})

let dbConnection

export async function initializeDatabase () {
  if (!dbConnection) {
    if (envResult.error) {
      console.warn(`[db] Could not load env file at ${envPath}: ${envResult.error.message}`)
    } else {
      console.log(`[db] Loaded env file: ${envPath}`)
    }

    console.log(`[db] Connecting to ${getMongoTarget(uri)} using database "${dbName}"`)

    try {
      await client.connect()
      dbConnection = client.db(dbName)
      console.log('[db] MongoDB connection established')

      await prepareDatabase()
      console.log('[db] Collections, indexes, settings, and seed users are ready')
    } catch (error) {
      console.error(`[db] MongoDB connection failed: ${error.message}`)
      throw error
    }
  }
  return dbConnection
}

export async function getCollections() {
  const db = await initializeDatabase()
  return {
    bills: db.collection('bills'),
    settings: db.collection('settings'),
    users: db.collection('users'),
    walletDeposits: db.collection('wallet_deposits'),
  }
}

async function prepareDatabase() {
  const users = dbConnection.collection('users')
  const bills = dbConnection.collection('bills')
  const settings = dbConnection.collection('settings')
  const walletDeposits = dbConnection.collection('wallet_deposits')
  const now = new Date()

  await users.createIndex({ username: 1 }, { unique: true })
  await users.createIndex({ id: 1 }, { unique: true })
  await bills.createIndex({ id: 1 }, { unique: true })
  await bills.createIndex({ user_id: 1, created_at: -1 })
  await walletDeposits.createIndex({ id: 1 }, { unique: true })
  await walletDeposits.createIndex({ transaction_id: 1 }, { unique: true })
  await walletDeposits.createIndex({ user_id: 1, created_at: -1 })
  await walletDeposits.createIndex({ status: 1, created_at: -1 })
  await settings.createIndex({ key: 1 }, { unique: true })
  await settings.updateOne(
    { key: 'bill_discount_percent' },
    { $setOnInsert: { key: 'bill_discount_percent', value: 0, updated_at: now } },
    { upsert: true }
  )
  await settings.updateOne(
    { key: 'recharge_discount_percent' },
    { $setOnInsert: { key: 'recharge_discount_percent', value: 0, updated_at: now } },
    { upsert: true }
  )

  const seedUsers = [
    {
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      name: 'Admin',
      role: 'admin',
      wallet_balance: 0,
      created_at: now,
    },
    {
      id: 'user-1',
      username: 'user',
      password: 'user123',
      name: 'Demo User',
      role: 'user',
      wallet_balance: 5000,
      created_at: now,
    },
  ]

  for (const user of seedUsers) {
    await users.updateOne(
      { username: user.username },
      { $setOnInsert: user },
      { upsert: true }
    )
  }
}
