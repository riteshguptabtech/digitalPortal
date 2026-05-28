import express from 'express'
import * as billController from '../controllers/billController.js'

const router = express.Router()

router.post('/', billController.createBill)
router.patch('/:id/status', billController.updateBill)

export default router