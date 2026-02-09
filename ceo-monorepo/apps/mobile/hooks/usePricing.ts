import { useState, useCallback } from 'react'
import {
  OrderItem,
  GroupBuyProduct,
  SettlementResult,
  calculateFinalPrice,
  calculateRefundAmount,
  calculatePointsEarned,
  processGroupBuySettlement,
  calculateOrderSettlementSummary,
  applyPointsToOrder,
  simulateGroupBuyProgress,
  generateSettlementNotification,
  checkGroupBuySettlementStatus,
  formatSettlementForDisplay,
} from '../lib/pricing'

export function usePricing() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateSettlement = useCallback(
    async (
      orderItems: OrderItem[],
      groupBuyProducts: Map<string, GroupBuyProduct>,
      pointsRate: number = 0.01
    ): Promise<SettlementResult[]> => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const settlements = processGroupBuySettlement(
          orderItems,
          groupBuyProducts,
          pointsRate
        )
        
        return settlements
      } catch (err) {
        setError('計算結算時發生錯誤')
        console.error('Pricing calculation error:', err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const calculateOrderSummary = useCallback(
    (settlements: SettlementResult[]) => {
      return calculateOrderSettlementSummary(settlements)
    },
    []
  )

  const calculatePointsApplication = useCallback(
    (
      orderTotal: number,
      pointsToUse: number,
      availablePoints: number,
      maxPointsRatio: number = 0.5
    ) => {
      return applyPointsToOrder(
        orderTotal,
        pointsToUse,
        availablePoints,
        maxPointsRatio
      )
    },
    []
  )

  const simulateProgress = useCallback(
    (
      initialSoldCount: number,
      targetCount: number,
      daysRemaining: number,
      dailyGrowthRate: number = 0.1
    ) => {
      return simulateGroupBuyProgress(
        initialSoldCount,
        targetCount,
        daysRemaining,
        dailyGrowthRate
      )
    },
    []
  )

  const getSettlementNotification = useCallback(
    (settlements: SettlementResult[], orderId: string) => {
      return generateSettlementNotification(settlements, orderId)
    },
    []
  )

  const getSettlementStatus = useCallback(
    (endDate: string, soldCount: number, minSettlementThreshold: number = 10) => {
      return checkGroupBuySettlementStatus(endDate, soldCount, minSettlementThreshold)
    },
    []
  )

  const formatSettlementDisplay = useCallback(
    (settlement: SettlementResult, productName: string) => {
      return formatSettlementForDisplay(settlement, productName)
    },
    []
  )

  // Helper function to create mock order items for testing
  const createMockOrderItems = useCallback((): OrderItem[] => {
    return [
      {
        id: '1',
        productId: 'product-1',
        quantity: 2,
        unitPrice: 2499,
        totalPrice: 4998,
      },
      {
        id: '2',
        productId: 'product-2',
        quantity: 1,
        unitPrice: 999,
        totalPrice: 999,
      },
    ]
  }, [])

  // Helper function to create mock group buy products for testing
  const createMockGroupBuyProducts = useCallback((): Map<string, GroupBuyProduct> => {
    const products = new Map<string, GroupBuyProduct>()
    
    products.set('product-1', {
      id: 'product-1',
      name: '高級辦公椅',
      priceTiers: [
        { quantity: 50, price: 2499, discount: 17 },
        { quantity: 100, price: 2299, discount: 23 },
        { quantity: 200, price: 1999, discount: 33 },
      ],
      soldCount: 150, // Final sold count after group buy
      targetCount: 200,
      endDate: '2024-12-31',
    })
    
    products.set('product-2', {
      id: 'product-2',
      name: '無線鍵盤滑鼠組',
      priceTiers: [
        { quantity: 30, price: 999, discount: 23 },
        { quantity: 60, price: 899, discount: 31 },
        { quantity: 100, price: 799, discount: 39 },
      ],
      soldCount: 45, // Final sold count after group buy
      targetCount: 100,
      endDate: '2024-12-31',
    })
    
    return products
  }, [])

  return {
    isLoading,
    error,
    calculateSettlement,
    calculateOrderSummary,
    calculatePointsApplication,
    simulateProgress,
    getSettlementNotification,
    getSettlementStatus,
    formatSettlementDisplay,
    createMockOrderItems,
    createMockGroupBuyProducts,
    
    // Direct utility functions
    calculateFinalPrice,
    calculateRefundAmount,
    calculatePointsEarned,
  }
}