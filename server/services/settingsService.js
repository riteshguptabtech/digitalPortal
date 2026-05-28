import { getCollections } from '../config/db.js'

const ELECTRICITY_DISCOUNT_KEY = 'bill_discount_percent'
const RECHARGE_DISCOUNT_KEY = 'recharge_discount_percent'
const PAYMENT_QR_KEY = 'payment_qr'
const ALLOWED_QR_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
const MAX_QR_BYTES = 1024 * 1024

function normalizeDiscount(value) {
  const discountPercent = Number(value)

  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100')
  }

  return discountPercent
}

async function getDiscountPercent(key) {
  const { settings } = await getCollections()
  const setting = await settings.findOne({ key })
  return Number(setting?.value || 0)
}

async function updateDiscountPercent(key, value) {
  const discountPercent = normalizeDiscount(value)

  const { settings } = await getCollections()
  const result = await settings.findOneAndUpdate(
    { key },
    {
      $set: {
        key,
        value: discountPercent,
        updated_at: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  )

  return Number(result.value || 0)
}

export async function getBillDiscountPercent() {
  return getDiscountPercent(ELECTRICITY_DISCOUNT_KEY)
}

export async function getRechargeDiscountPercent() {
  return getDiscountPercent(RECHARGE_DISCOUNT_KEY)
}

export async function getDiscountSettings() {
  const [discountPercent, rechargeDiscountPercent] = await Promise.all([
    getBillDiscountPercent(),
    getRechargeDiscountPercent(),
  ])

  return {
    discountPercent,
    billDiscountPercent: discountPercent,
    rechargeDiscountPercent,
  }
}

export async function updateBillDiscountPercent(value) {
  return updateDiscountPercent(ELECTRICITY_DISCOUNT_KEY, value)
}

export async function updateRechargeDiscountPercent(value) {
  return updateDiscountPercent(RECHARGE_DISCOUNT_KEY, value)
}

export async function getPaymentQr() {
  const { settings } = await getCollections()
  const setting = await settings.findOne({ key: PAYMENT_QR_KEY })
  return setting?.value || null
}

export async function updatePaymentQr(data) {
  const dataUrl = String(data?.dataUrl || '')
  const fileName = String(data?.fileName || 'payment-qr')
  const mimeType = String(data?.mimeType || '')
  const match = dataUrl.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/)

  if (!match) {
    throw new Error('Upload a valid QR image')
  }

  const detectedMimeType = match[1]
  const base64 = match[2]
  const size = Buffer.byteLength(base64, 'base64')

  if (mimeType && mimeType !== detectedMimeType) {
    throw new Error('QR image type does not match the uploaded file')
  }

  if (!ALLOWED_QR_TYPES.has(detectedMimeType)) {
    throw new Error('QR image must be PNG, JPG, WEBP, or SVG')
  }

  if (size > MAX_QR_BYTES) {
    throw new Error('QR image must be 1 MB or smaller')
  }

  const qr = {
    dataUrl,
    fileName,
    mimeType: detectedMimeType,
    size,
    updatedAt: new Date(),
  }

  const { settings } = await getCollections()
  const result = await settings.findOneAndUpdate(
    { key: PAYMENT_QR_KEY },
    {
      $set: {
        key: PAYMENT_QR_KEY,
        value: qr,
        updated_at: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  )

  return result.value
}
