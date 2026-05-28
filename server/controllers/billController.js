import * as billService from '../services/billService.js'

export async function createBill(req, res, next) {
  try {
    const result = await billService.createBill(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function updateBill(req, res, next) {
  try {
    const result = await billService.updateBillStatus(
      req.params.id,
      req.body.status,
      req.body.rejectionReason
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}
