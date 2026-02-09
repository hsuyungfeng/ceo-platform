import React from 'react'
import { View, Text } from 'react-native'
import { Progress } from './Progress'
import { Badge } from './Badge'
import { Clock, Users, TrendingDown } from 'lucide-react-native'
import { cn } from '../../lib/utils'

export interface PriceTier {
  quantity: number
  price: number
  discount: number
}

export interface GroupBuyProgressProps {
  soldCount: number
  targetCount: number
  priceTiers: PriceTier[]
  currentPrice: number
  basePrice: number
  endDate?: string
  showTimeRemaining?: boolean
  showNextTier?: boolean
  compact?: boolean
}

export function GroupBuyProgress({
  soldCount,
  targetCount,
  priceTiers,
  currentPrice,
  basePrice,
  endDate,
  showTimeRemaining = true,
  showNextTier = true,
  compact = false,
}: GroupBuyProgressProps) {
  const progress = Math.min((soldCount / targetCount) * 100, 100)
  const sortedTiers = [...priceTiers].sort((a, b) => a.quantity - b.quantity)
  
  // Find current tier and next tier
  let currentTier = sortedTiers[0]
  let nextTier: PriceTier | null = null
  
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (soldCount >= sortedTiers[i].quantity) {
      currentTier = sortedTiers[i]
      if (i + 1 < sortedTiers.length) {
        nextTier = sortedTiers[i + 1]
      }
      break
    }
  }
  
  // Calculate remaining to next tier
  const remainingToNextTier = nextTier ? nextTier.quantity - soldCount : 0
  const nextTierProgress = nextTier 
    ? Math.min((soldCount / nextTier.quantity) * 100, 100)
    : 100
  
  // Calculate time remaining if endDate is provided
  const calculateTimeRemaining = () => {
    if (!endDate) return null
    
    const end = new Date(endDate)
    const now = new Date()
    const diffMs = end.getTime() - now.getTime()
    
    if (diffMs <= 0) return '已結束'
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diffDays > 0) {
      return `${diffDays}天${diffHours}小時`
    }
    return `${diffHours}小時`
  }
  
  const timeRemaining = calculateTimeRemaining()
  
  if (compact) {
    return (
      <View className="bg-white rounded-lg p-4 border border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Users size={16} className="text-gray-500 mr-1" />
            <Text className="text-sm font-medium text-gray-700">
              {soldCount} / {targetCount} 人
            </Text>
          </View>
          <Badge variant="secondary" className="px-2 py-1">
            {progress.toFixed(0)}%
          </Badge>
        </View>
        
        <Progress value={progress} className="h-2 mb-2" />
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TrendingDown size={16} className="text-green-600 mr-1" />
            <Text className="text-sm font-medium text-green-600">
              ${currentPrice}
            </Text>
            <Text className="text-sm text-gray-500 line-through ml-1">
              ${basePrice}
            </Text>
          </View>
          
          {showTimeRemaining && timeRemaining && (
            <View className="flex-row items-center">
              <Clock size={14} className="text-gray-500 mr-1" />
              <Text className="text-xs text-gray-500">{timeRemaining}</Text>
            </View>
          )}
        </View>
      </View>
    )
  }
  
  return (
    <View className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-bold text-gray-900">團購進度</Text>
          <Text className="text-sm text-gray-500">
            已達成 {soldCount} 件，目標 {targetCount} 件
          </Text>
        </View>
        <Badge variant="default" className="px-3 py-1">
          {progress.toFixed(0)}% 達成
        </Badge>
      </View>
      
      <Progress value={progress} className="h-3 mb-6" />
      
      <View className="space-y-4">
        {/* Current Price */}
        <View className="flex-row justify-between items-center p-3 bg-blue-50 rounded-lg">
          <View>
            <Text className="text-sm font-medium text-gray-700">目前價格</Text>
            <Text className="text-xs text-gray-500">
              已達成 {currentTier.quantity}+ 件門檻
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-blue-600">${currentPrice}</Text>
            <Text className="text-lg text-gray-500 line-through ml-2">${basePrice}</Text>
            <Badge variant="outline" className="ml-2">
              -{currentTier.discount}%
            </Badge>
          </View>
        </View>
        
        {/* Next Tier Progress */}
        {showNextTier && nextTier && (
          <View className="p-3 bg-green-50 rounded-lg">
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-sm font-medium text-gray-700">下一價格門檻</Text>
                <Text className="text-xs text-gray-500">
                  再 {remainingToNextTier} 件可享 ${nextTier.price}
                </Text>
              </View>
              <Badge variant="outline" className="bg-white">
                -{nextTier.discount}%
              </Badge>
            </View>
            
            <Progress value={nextTierProgress} className="h-2" />
            <View className="flex-row justify-between mt-1">
              <Text className="text-xs text-gray-500">{soldCount} 件</Text>
              <Text className="text-xs text-gray-500">{nextTier.quantity} 件</Text>
            </View>
          </View>
        )}
        
        {/* Time Remaining */}
        {showTimeRemaining && timeRemaining && (
          <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
            <View className="flex-row items-center">
              <Clock size={18} className="text-gray-500 mr-2" />
              <Text className="text-sm font-medium text-gray-700">剩餘時間</Text>
            </View>
            <Text className="text-sm font-bold text-gray-900">{timeRemaining}</Text>
          </View>
        )}
        
        {/* All Price Tiers */}
        <View className="mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">價格階梯</Text>
          <View className="space-y-2">
            {sortedTiers.map((tier, index) => {
              const isCurrent = tier.quantity === currentTier.quantity
              const isAchieved = soldCount >= tier.quantity
              
              return (
                <View
                  key={tier.quantity}
                  className={`flex-row justify-between items-center p-2 rounded ${
                    isCurrent ? 'bg-blue-100 border border-blue-200' :
                    isAchieved ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Users size={14} className={`mr-2 ${
                      isCurrent ? 'text-blue-600' :
                      isAchieved ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <Text className={`text-sm ${
                      isCurrent ? 'font-bold text-blue-700' :
                      isAchieved ? 'font-medium text-green-700' : 'text-gray-600'
                    }`}>
                      {tier.quantity}+ 件
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-700' :
                      isAchieved ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      ${tier.price}
                    </Text>
                    <Text className="text-xs text-gray-500 line-through ml-2">
                      ${basePrice}
                    </Text>
                    <Badge
                      variant={isCurrent ? 'default' : 'outline'}
                      className={`ml-2 ${isCurrent ? 'bg-blue-100 text-blue-700' : ''}`}
                    >
                      -{tier.discount}%
                    </Badge>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </View>
      
      {/* Call to Action */}
      <View className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Text className="text-sm font-medium text-yellow-800 text-center">
          🎯 每增加一位購買，價格就更優惠！
        </Text>
        {nextTier && (
          <Text className="text-xs text-yellow-700 text-center mt-1">
            再 {remainingToNextTier} 人購買，每人可再省 ${currentPrice - nextTier.price}
          </Text>
        )}
      </View>
    </View>
  )
}