import { client, initializeDatabase } from './config/db.js'

await initializeDatabase()
await client.close()

console.log('Database setup complete')
