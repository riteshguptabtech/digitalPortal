import express from 'express'
import * as settingsService from '../services/settingsService.js'

const router = express.Router()

router.patch('/discount', async (req, res, next) => {
  try {
    const [discountPercent, rechargeDiscountPercent] = await Promise.all([
      req.body.discountPercent === undefined
        ? settingsService.getBillDiscountPercent()
        : settingsService.updateBillDiscountPercent(req.body.discountPercent),
      req.body.rechargeDiscountPercent === undefined
        ? settingsService.getRechargeDiscountPercent()
        : settingsService.updateRechargeDiscountPercent(req.body.rechargeDiscountPercent),
    ])

    res.json({
      discountPercent,
      billDiscountPercent: discountPercent,
      rechargeDiscountPercent,
    })
  } catch (err) {
    next(err)
  }
})

router.patch('/payment-qr', async (req, res, next) => {
  try {
    const paymentQr = await settingsService.updatePaymentQr(req.body)
    res.json({ paymentQr })
  } catch (err) {
    next(err)
  }
})

router.patch('/recharge-plans', async (req, res, next) => {
  try {
    const rechargePlans = await settingsService.updateRechargePlans(req.body.plans)
    res.json({ rechargePlans })
  } catch (err) {
    next(err)
  }
})

export default router
