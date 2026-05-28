import express from 'express'
import * as walletService from '../services/walletService.js'

const router = express.Router()

router.post('/deposit', async (req, res, next) => {
  try {
    const deposit = await walletService.createDepositRequest(req.body)
    res.status(201).json({ deposit })
  } catch (err) {
    next(err)
  }
})

router.patch('/deposits/:id/status', async (req, res, next) => {
  try {
    const result = await walletService.updateDepositStatus(
      req.params.id,
      req.body.status,
      req.body.rejectionReason
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router
