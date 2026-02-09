import { PriceTier } from '../stores/useProductStore'

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number // Price at time of order
  totalPrice: number // unitPrice * quantity
}

export interface GroupBuyProduct {
  id: string
  name: string
  priceTiers: PriceTier[]
  soldCount: number
  targetCount: number
  endDate: string
}

export interface SettlementResult {
  finalUnitPrice: number
  finalTotalPrice: number
  refundAmount: number
  pointsEarned: number
  settlementStatus: 'pending' | 'completed' | 'failed'
  settlementDate: string | null
}

export interface MemberPoints {
  userId: string
  availablePoints: number
  pendingPoints: number
  totalEarned: number
  totalUsed: number
  transactions: PointsTransaction[]
}

export interface PointsTransaction {
  id: string
  userId: string
  orderId: string
  productId: string
  type: 'earn' | 'use' | 'refund' | 'expire'
  points: number
  description: string
  createdAt: string
  status: 'pending' | 'completed' | 'cancelled'
}

/**
 * Calculate the final price based on group buying results
 */
export function calculateFinalPrice(
  orderPrice: number,
  finalSoldCount: number,
  priceTiers: PriceTier[]
): number {
  if (!priceTiers.length) return orderPrice
  
  // Sort tiers by quantity ascending
  const sortedTiers = [...priceTiers].sort((a, b) => a.quantity - b.quantity)
  
  // Find the applicable tier based on final sold count
  let applicableTier = sortedTiers[0]
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (finalSoldCount >= sortedTiers[i].quantity) {
      applicableTier = sortedTiers[i]
      break
    }
  }
  
  return applicableTier.price
}

/**
 * Calculate refund amount when final price is lower than order price
 */
export function calculateRefundAmount(
  orderPrice: number,
  finalPrice: number,
  quantity: number
): number {
  if (finalPrice >= orderPrice) return 0
  return (orderPrice - finalPrice) * quantity
}

/**
 * Calculate points earned from a purchase
 */
export function calculatePointsEarned(
  finalPrice: number,
  quantity: number,
  pointsRate: number = 0.01 // 1% of purchase amount
): number {
  return Math.floor(finalPrice * quantity * pointsRate)
}

/**
 * Process group buying settlement for an order
 */
export function processGroupBuySettlement(
  orderItems: OrderItem[],
  groupBuyProducts: Map<string, GroupBuyProduct>,
  pointsRate: number = 0.01
): SettlementResult[] {
  const settlements: SettlementResult[] = []
  
  for (const item of orderItems) {
    const product = groupBuyProducts.get(item.productId)
    
    if (!product) {
      // Product not found in group buy, use original price
      settlements.push({
        finalUnitPrice: item.unitPrice,
        finalTotalPrice: item.totalPrice,
        refundAmount: 0,
        pointsEarned: calculatePointsEarned(item.unitPrice, item.quantity, pointsRate),
        settlementStatus: 'completed',
        settlementDate: new Date().toISOString(),
      })
      continue
    }
    
    // Calculate final price based on group buying results
    const finalUnitPrice = calculateFinalPrice(
      item.unitPrice,
      product.soldCount,
      product.priceTiers
    )
    
    const finalTotalPrice = finalUnitPrice * item.quantity
    const refundAmount = calculateRefundAmount(item.unitPrice, finalUnitPrice, item.quantity)
    const pointsEarned = calculatePointsEarned(finalUnitPrice, item.quantity, pointsRate)
    
    settlements.push({
      finalUnitPrice,
      finalTotalPrice,
      refundAmount,
      pointsEarned,
      settlementStatus: 'completed',
      settlementDate: new Date().toISOString(),
    })
  }
  
  return settlements
}

/**
 * Calculate total refund and points for an order
 */
export function calculateOrderSettlementSummary(
  settlements: SettlementResult[]
): {
  totalRefund: number
  totalPoints: number
  finalOrderTotal: number
  originalOrderTotal: number
} {
  const originalOrderTotal = settlements.reduce(
    (sum, settlement) => sum + (settlement.finalTotalPrice + settlement.refundAmount),
    0
  )
  
  const totalRefund = settlements.reduce((sum, settlement) => sum + settlement.refundAmount, 0)
  const totalPoints = settlements.reduce((sum, settlement) => sum + settlement.pointsEarned, 0)
  const finalOrderTotal = originalOrderTotal - totalRefund
  
  return {
    totalRefund,
    totalPoints,
    finalOrderTotal,
    originalOrderTotal,
  }
}

/**
 * Apply points to an order
 */
export function applyPointsToOrder(
  orderTotal: number,
  pointsToUse: number,
  availablePoints: number,
  maxPointsRatio: number = 0.5 // Maximum 50% of order can be paid with points
): {
  pointsUsed: number
  pointsDiscount: number
  finalAmount: number
  remainingPoints: number
} {
  // Cap points to use at available points
  const cappedPoints = Math.min(pointsToUse, availablePoints)
  
  // Calculate maximum points allowed for this order
  const maxPointsForOrder = Math.floor(orderTotal * maxPointsRatio)
  const actualPointsUsed = Math.min(cappedPoints, maxPointsForOrder)
  
  // 1 point = 1 TWD
  const pointsDiscount = actualPointsUsed
  const finalAmount = Math.max(0, orderTotal - pointsDiscount)
  const remainingPoints = availablePoints - actualPointsUsed
  
  return {
    pointsUsed: actualPointsUsed,
    pointsDiscount,
    finalAmount,
    remainingPoints,
  }
}

/**
 * Simulate group buying progress over time
 */
export function simulateGroupBuyProgress(
  initialSoldCount: number,
  targetCount: number,
  daysRemaining: number,
  dailyGrowthRate: number = 0.1 // 10% daily growth
): {
  dailyProgress: Array<{ day: number; soldCount: number; progress: number }>
  estimatedFinalCount: number
  willReachTarget: boolean
} {
  const dailyProgress = []
  let currentCount = initialSoldCount
  
  for (let day = 0; day <= daysRemaining; day++) {
    const progress = Math.min((currentCount / targetCount) * 100, 100)
    dailyProgress.push({ day, soldCount: currentCount, progress })
    
    if (day < daysRemaining) {
      // Simulate daily growth
      const dailyIncrease = Math.floor(currentCount * dailyGrowthRate)
      currentCount += dailyIncrease
    }
  }
  
  const estimatedFinalCount = currentCount
  const willReachTarget = estimatedFinalCount >= targetCount
  
  return {
    dailyProgress,
    estimatedFinalCount,
    willReachTarget,
  }
}

/**
 * Generate settlement notification message
 */
export function generateSettlementNotification(
  settlements: SettlementResult[],
  orderId: string
): string {
  const summary = calculateOrderSettlementSummary(settlements)
  
  if (summary.totalRefund === 0) {
    return `訂單 ${orderId} 結算完成！您獲得了 ${summary.totalPoints} 點會員點數。`
  }
  
  return `🎉 好消息！訂單 ${orderId} 因團購達成更低價格，您獲得 ${summary.totalRefund} 元退款和 ${summary.totalPoints} 點會員點數。退款已存入您的會員點數帳戶。`
}

/**
 * Check if a group buy has ended and needs settlement
 */
export function checkGroupBuySettlementStatus(
  endDate: string,
  soldCount: number,
  minSettlementThreshold: number = 10 // Minimum 10 items sold to trigger settlement
): {
  shouldSettle: boolean
  status: 'active' | 'ended_pending' | 'ended_settled' | 'cancelled'
  daysSinceEnd: number
} {
  const end = new Date(endDate)
  const now = new Date()
  const daysSinceEnd = Math.floor((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24))
  
  if (now < end) {
    return {
      shouldSettle: false,
      status: 'active',
      daysSinceEnd: 0,
    }
  }
  
  if (soldCount < minSettlementThreshold) {
    return {
      shouldSettle: true,
      status: 'cancelled',
      daysSinceEnd,
    }
  }
  
  // For demo purposes, assume settlement happens 1 day after group buy ends
  if (daysSinceEnd >= 1) {
    return {
      shouldSettle: true,
      status: 'ended_settled',
      daysSinceEnd,
    }
  }
  
  return {
    shouldSettle: false,
    status: 'ended_pending',
    daysSinceEnd,
  }
}

/**
 * Format settlement results for display
 */
export function formatSettlementForDisplay(
  settlement: SettlementResult,
  productName: string
): {
  title: string
  description: string
  amount: string
  type: 'refund' | 'points' | 'no_change'
} {
  if (settlement.refundAmount > 0) {
    return {
      title: `🎉 ${productName} 價格下降`,
      description: `因團購達成更低價格，您獲得退款`,
      amount: `-${settlement.refundAmount} 元`,
      type: 'refund',
    }
  }
  
  if (settlement.pointsEarned > 0) {
    return {
      title: `✨ ${productName} 點數回饋`,
      description: `購物獲得會員點數`,
      amount: `+${settlement.pointsEarned} 點`,
      type: 'points',
    }
  }
  
  return {
    title: `✅ ${productName} 結算完成`,
    description: `價格維持不變`,
    amount: `0 元`,
    type: 'no_change',
  }
}