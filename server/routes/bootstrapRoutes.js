import express from 'express'
import { getCollections } from '../config/db.js'
import { serializeBill, serializeDeposit, serializeWallet } from '../utils/serializers.js'
import { getDiscountSettings, getPaymentQr, getRechargePlans } from '../services/settingsService.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { bills, users, walletDeposits } = await getCollections()
    const [billDocs, depositDocs, userDocs, discountSettings, paymentQr, rechargePlans] = await Promise.all([
      bills.find({}).sort({ created_at: -1 }).toArray(),
      walletDeposits.find({}).sort({ created_at: -1 }).toArray(),
      users.find({ role: 'user' }).toArray(),
      getDiscountSettings(),
      getPaymentQr(),
      getRechargePlans(),
    ])

    const usersById = new Map(userDocs.map((user) => [user.id, user]))

    res.json({
      bills: billDocs.map((bill) => serializeBill(bill, usersById.get(bill.user_id))),
      deposits: depositDocs.map((deposit) => serializeDeposit(deposit, usersById.get(deposit.user_id))),
      ...discountSettings,
      paymentQr,
      rechargePlans,
      wallet: serializeWallet(userDocs),
    })
  } catch (err) {
    next(err)
  }
})

export default router
