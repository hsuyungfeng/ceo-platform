import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Badge } from './Badge'
import { Button } from './Button'
import { CreditCard, Gift, RefreshCw, CheckCircle } from 'lucide-react-native'
import { SettlementResult } from '../../lib/pricing'
import { usePricing } from '../../hooks/usePricing'
import { cn } from '../../lib/utils'

export interface SettlementDisplayProps {
  settlements: SettlementResult[]
  productNames: Map<string, string>
  orderId: string
  onUsePoints?: (points: number) => void
  onViewDetails?: () => void
  className?: string
}

export function SettlementDisplay({
  settlements,
  productNames,
  orderId,
  onUsePoints,
  onViewDetails,
  className,
}: SettlementDisplayProps) {
  const { calculateOrderSummary, formatSettlementDisplay, getSettlementNotification } = usePricing()
  
  const summary = calculateOrderSummary(settlements)
  const notification = getSettlementNotification(settlements, orderId)
  
  const hasRefund = summary.totalRefund > 0
  const hasPoints = summary.totalPoints > 0
  
  return (
    <View className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {/* Header */}
      <View className="p-6 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-bold text-gray-900">團購結算結果</Text>
          <Badge variant={hasRefund ? 'default' : 'secondary'}>
            {hasRefund ? '有退款' : '已結算'}
          </Badge>
        </View>
        <Text className="text-gray-600">{notification}</Text>
      </View>
      
      {/* Summary */}
      <View className="p-6 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900 mb-4">結算摘要</Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700">原始訂單金額</Text>
            <Text className="text-lg font-medium text-gray-900">
              ${summary.originalOrderTotal}
            </Text>
          </View>
          
          {hasRefund && (
            <View className="flex-row justify-between items-center bg-green-50 p-3 rounded-lg">
              <View className="flex-row items-center">
                <RefreshCw size={18} className="text-green-600 mr-2" />
                <Text className="text-green-700 font-medium">團購退款</Text>
              </View>
              <Text className="text-xl font-bold text-green-600">
                -${summary.totalRefund}
              </Text>
            </View>
          )}
          
          {hasPoints && (
            <View className="flex-row justify-between items-center bg-blue-50 p-3 rounded-lg">
              <View className="flex-row items-center">
                <Gift size={18} className="text-blue-600 mr-2" />
                <Text className="text-blue-700 font-medium">會員點數</Text>
              </View>
              <Text className="text-xl font-bold text-blue-600">
                +{summary.totalPoints} 點
              </Text>
            </View>
          )}
          
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-900">最終支付金額</Text>
            <Text className="text-2xl font-bold text-gray-900">
              ${summary.finalOrderTotal}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Item Details */}
      <ScrollView className="max-h-80">
        <View className="p-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">商品明細</Text>
          
          <View className="space-y-4">
            {settlements.map((settlement, index) => {
              const productName = productNames.get(`product-${index + 1}`) || `商品 ${index + 1}`
              const display = formatSettlementDisplay(settlement, productName)
              
              return (
                <View
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border',
                    display.type === 'refund' ? 'bg-green-50 border-green-200' :
                    display.type === 'points' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  )}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-medium text-gray-900">{display.title}</Text>
                    <Badge
                      variant={
                        display.type === 'refund' ? 'default' :
                        display.type === 'points' ? 'secondary' : 'outline'
                      }
                    >
                      {display.type === 'refund' ? '退款' :
                       display.type === 'points' ? '點數' : '不變'}
                    </Badge>
                  </View>
                  
                  <Text className="text-gray-600 mb-3">{display.description}</Text>
                  
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm text-gray-500">數量</Text>
                      <Text className="font-medium">1 件</Text>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500">原始單價</Text>
                      <Text className="font-medium line-through text-gray-500">
                        ${settlement.finalUnitPrice + (settlement.refundAmount || 0)}
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500">結算單價</Text>
                      <Text className="font-medium text-gray-900">
                        ${settlement.finalUnitPrice}
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-sm text-gray-500">結算結果</Text>
                      <Text className={cn(
                        'font-bold',
                        display.type === 'refund' ? 'text-green-600' :
                        display.type === 'points' ? 'text-blue-600' : 'text-gray-600'
                      )}>
                        {display.amount}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </ScrollView>
      
      {/* Actions */}
      <View className="p-6 border-t border-gray-100">
        <View className="space-y-3">
          {hasPoints && onUsePoints && (
            <Button
              variant="outline"
              className="w-full"
              onPress={() => onUsePoints(summary.totalPoints)}
            >
              <Gift size={18} className="mr-2" />
              使用 {summary.totalPoints} 點折抵下次購物
            </Button>
          )}
          
          {hasRefund && (
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <View className="flex-row items-start mb-2">
                <CreditCard size={18} className="text-yellow-600 mr-2 mt-0.5" />
                <View className="flex-1">
                  <Text className="font-medium text-yellow-800">退款說明</Text>
                  <Text className="text-sm text-yellow-700 mt-1">
                    退款金額 {summary.totalRefund} 元已存入您的會員點數帳戶。
                    您可以在下次購物時使用點數折抵，或聯繫客服申請提現。
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          <View className="flex-row items-center justify-center pt-2">
            <CheckCircle size={16} className="text-green-500 mr-2" />
            <Text className="text-sm text-gray-500">
              結算完成時間: {new Date().toLocaleDateString('zh-TW')}
            </Text>
          </View>
          
          {onViewDetails && (
            <Button
              variant="ghost"
              className="w-full mt-2"
              onPress={onViewDetails}
            >
              查看詳細結算記錄
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}

// Compact version for order history
export function CompactSettlementDisplay({
  settlements,
  orderId,
}: {
  settlements: SettlementResult[]
  orderId: string
}) {
  const { calculateOrderSummary, getSettlementNotification } = usePricing()
  
  const summary = calculateOrderSummary(settlements)
  const notification = getSettlementNotification(settlements, orderId)
  const hasRefund = summary.totalRefund > 0
  
  return (
    <View className="bg-white rounded-lg border border-gray-200 p-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-medium text-gray-900">團購結算</Text>
        <Badge variant={hasRefund ? 'default' : 'secondary'} size="sm">
          {hasRefund ? '有退款' : '已結算'}
        </Badge>
      </View>
      
      <Text className="text-sm text-gray-600 mb-3">{notification}</Text>
      
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xs text-gray-500">最終金額</Text>
          <Text className="font-bold text-gray-900">${summary.finalOrderTotal}</Text>
        </View>
        
        {hasRefund && (
          <View className="bg-green-50 px-3 py-1 rounded-full">
            <Text className="text-sm font-medium text-green-700">
              退款 ${summary.totalRefund}
            </Text>
          </View>
        )}
        
        {summary.totalPoints > 0 && (
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-sm font-medium text-blue-700">
              +{summary.totalPoints} 點
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}