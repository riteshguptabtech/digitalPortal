import crypto from 'node:crypto'
import { getCollections } from '../config/db.js'
import { serializeDeposit } from '../utils/serializers.js'

export async function createDepositRequest(data) {
  const { users, walletDeposits } = await getCollections()
  const amount = Number(data.amount)
  const transactionId = String(data.transactionId || '').trim()

  if (!data.userId || !Number.isFinite(amount) || amount <= 0 || !transactionId) {
    throw new Error('A valid amount and transaction ID are required')
  }

  const user = await users.findOne({ id: data.userId, role: 'user' })
  if (!user) throw new Error('User not found')

  const duplicate = await walletDeposits.findOne({ transaction_id: transactionId })
  if (duplicate) throw new Error('This transaction ID was already submitted')

  const deposit = {
    id: `deposit-${crypto.randomUUID()}`,
    user_id: data.userId,
    amount,
    transaction_id: transactionId,
    status: 'pending',
    rejection_reason: null,
    created_at: new Date(),
  }

  await walletDeposits.insertOne(deposit)
  return serializeDeposit(deposit, user)
}

export async function updateDepositStatus(id, status, rejectionReason = null) {
  const { users, walletDeposits } = await getCollections()

  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Invalid deposit status')
  }

  const deposit = await walletDeposits.findOne({ id })
  if (!deposit) throw new Error('Deposit request not found')

  if (deposit.status !== 'pending') {
    throw new Error('Deposit request already processed')
  }

  const user = await users.findOne({ id: deposit.user_id })
  if (!user) throw new Error('User not found')

  let updatedUser = user

  if (status === 'approved') {
    updatedUser = await users.findOneAndUpdate(
      { id: user.id },
      { $inc: { wallet_balance: deposit.amount } },
      { returnDocument: 'after' }
    )
  }

  const updatedDeposit = {
    ...deposit,
    status,
    rejection_reason: status === 'rejected' ? rejectionReason || 'Rejected by admin' : null,
  }

  await walletDeposits.updateOne(
    { id },
    {
      $set: {
        status: updatedDeposit.status,
        rejection_reason: updatedDeposit.rejection_reason,
      },
    }
  )

  return {
    deposit: serializeDeposit(updatedDeposit, user),
    wallet: { [updatedUser.id]: updatedUser.wallet_balance ?? 0 },
  }
}
