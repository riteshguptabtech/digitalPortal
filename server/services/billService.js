import crypto from 'node:crypto'
import { getCollections } from '../config/db.js'
import { serializeBill } from '../utils/serializers.js'
import { getBillDiscountPercent, getRechargeDiscountPercent } from './settingsService.js'

export async function createBill(data) {
  const { bills, users } = await getCollections()
  const requestType = data.requestType === 'mobile_recharge' ? 'mobile_recharge' : 'electricity'
  const originalAmount = Number(data.amount)
  const units = Number(data.units)

  if (!data.userId || !Number.isFinite(originalAmount) || originalAmount <= 0) {
    throw new Error('Valid request details are required')
  }

  if (requestType === 'electricity' && (!data.customerId || !data.state || !/^\d+$/.test(String(data.customerId)))) {
    throw new Error('Valid bill details are required')
  }

  if (requestType === 'mobile_recharge' && (!data.mobileNumber || !data.operator)) {
    throw new Error('Valid recharge details are required')
  }

  const discountPercent = requestType === 'electricity'
    ? await getBillDiscountPercent()
    : await getRechargeDiscountPercent()
  const discountAmount = Math.round((originalAmount * discountPercent) / 100)
  const amount = Math.max(originalAmount - discountAmount, 0)

  const existingUser = await users.findOne({ id: data.userId })
  if (!existingUser) throw new Error('User not found')

  const user = await users.findOneAndUpdate(
    { id: data.userId, wallet_balance: { $gte: amount } },
    { $inc: { wallet_balance: -amount } },
    { returnDocument: 'after' }
  )
  if (!user) throw new Error('Insufficient balance')

  const bill = {
    id: `bill-${crypto.randomUUID()}`,
    request_type: requestType,
    user_id: data.userId,
    state: requestType === 'electricity' ? data.state : null,
    customer_id: requestType === 'electricity' ? data.customerId : data.mobileNumber,
    mobile_number: requestType === 'mobile_recharge' ? data.mobileNumber : null,
    operator: requestType === 'mobile_recharge' ? data.operator : null,
    circle: null,
    plan_name: requestType === 'mobile_recharge' ? data.planName || 'Custom recharge' : null,
    original_amount: originalAmount,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    amount,
    units: Number.isFinite(units) ? units : 0,
    status: 'pending',
    wallet_debited: true,
    created_at: new Date(),
  }

  await bills.insertOne(bill)
  return {
    bill: serializeBill(bill, user),
    wallet: { [user.id]: user.wallet_balance ?? 0 },
  }
}

export async function updateBillStatus(id, status, rejectionReason) {
  const { bills, users } = await getCollections()

  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Invalid bill status')
  }

  const bill = await bills.findOne({ id })
  if (!bill) throw new Error('Bill not found')

  if (bill.status !== 'pending') {
    throw new Error('Already processed')
  }

  const user = await users.findOne({ id: bill.user_id })
  if (!user) throw new Error('User not found')

  let updatedUser = user

  if (status === 'rejected' && bill.wallet_debited === true) {
    updatedUser = await users.findOneAndUpdate(
      { id: user.id },
      { $inc: { wallet_balance: bill.amount } },
      { returnDocument: 'after' }
    )
  }

  const updatedBill = {
    ...bill,
    status,
    rejection_reason: status === 'rejected' ? rejectionReason || 'Rejected by admin' : null,
  }

  await bills.updateOne(
    { id },
    {
      $set: {
        status: updatedBill.status,
        rejection_reason: updatedBill.rejection_reason,
      },
    }
  )

  return {
    bill: serializeBill(updatedBill, user),
    wallet: { [updatedUser.id]: updatedUser.wallet_balance ?? 0 },
  }
}
