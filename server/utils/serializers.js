export function serializeUser(user) {
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    address: user.address || '',
    phone: user.phone || '',
    email: user.email || '',
    role: user.role,
    walletBalance: user.wallet_balance ?? 0,
  }
}

export function serializeBill(bill, user = null) {
  if (!bill) return null
  const originalAmount = bill.original_amount ?? bill.amount
  const discountPercent = bill.discount_percent ?? 0
  const discountAmount = bill.discount_amount ?? 0

  return {
    id: bill.id,
    requestType: bill.request_type || 'electricity',
    userId: bill.user_id,
    userName: user?.name || bill.user_name || 'Unknown user',
    customerId: bill.customer_id,
    mobileNumber: bill.mobile_number || null,
    operator: bill.operator || null,
    circle: bill.circle || null,
    planName: bill.plan_name || null,
    state: bill.state,
    amount: bill.amount,
    originalAmount,
    discountPercent,
    discountAmount,
    units: bill.units,
    status: bill.status,
    rejectionReason: bill.rejection_reason || null,
    createdAt: bill.created_at,
  }
}

export function serializeDeposit(deposit, user = null) {
  if (!deposit) return null

  return {
    id: deposit.id,
    userId: deposit.user_id,
    userName: user?.name || deposit.user_name || 'Unknown user',
    amount: deposit.amount,
    transactionId: deposit.transaction_id,
    status: deposit.status,
    rejectionReason: deposit.rejection_reason || null,
    createdAt: deposit.created_at,
  }
}

export function serializeWallet(users) {
  return users.reduce((wallet, user) => {
    wallet[user.id] = user.wallet_balance ?? 0
    return wallet
  }, {})
}
