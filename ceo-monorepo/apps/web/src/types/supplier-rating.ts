/**
 * 供應商評分相關類型定義
 */

import { z } from 'zod'

// 評分維度 (對應資料庫欄位)
export enum RatingDimension {
  OVERALL = 'overallScore', // 總體評分
  QUALITY = 'qualityScore', // 產品品質
  DELIVERY = 'deliveryScore', // 交貨準時
  SERVICE = 'serviceScore' // 客戶服務
}

// 評分維度標籤映射
export const RATING_DIMENSION_LABELS: Record<string, string> = {
  overallScore: '總體評分',
  qualityScore: '產品品質',
  deliveryScore: '交貨準時',
  serviceScore: '客戶服務'
}

// 評分維度描述
export const RATING_DIMENSION_DESCRIPTIONS: Record<string, string> = {
  overallScore: '整體採購體驗和滿意度',
  qualityScore: '產品的品質、耐用性和符合規格程度',
  deliveryScore: '交貨準時性、包裝完整性和物流品質',
  serviceScore: '客服響應速度、問題解決能力和專業態度'
}

// 評分提交請求 Schema
export const SupplierRatingCreateSchema = z.object({
  supplierId: z.string().min(1, '供應商 ID 為必填'),
  orderId: z.string().optional(), // 可選：關聯的訂單 ID
  overallScore: z.number().int().min(1).max(5, '總體評分必須在 1-5 之間'),
  qualityScore: z.number().int().min(1).max(5, '品質評分必須在 1-5 之間').optional(),
  deliveryScore: z.number().int().min(1).max(5, '交貨評分必須在 1-5 之間').optional(),
  serviceScore: z.number().int().min(1).max(5, '服務評分必須在 1-5 之間').optional(),
  comment: z.string().max(1000, '評價內容不能超過 1000 字').optional(),
  photoUrls: z.array(z.string().url()).optional(),
  isPublic: z.boolean().default(true) // 是否公開顯示
})

export type SupplierRatingCreateInput = z.infer<typeof SupplierRatingCreateSchema>

// 評分更新請求 Schema
export const SupplierRatingUpdateSchema = z.object({
  overallScore: z.number().int().min(1).max(5).optional(),
  qualityScore: z.number().int().min(1).max(5).optional(),
  deliveryScore: z.number().int().min(1).max(5).optional(),
  serviceScore: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  photoUrls: z.array(z.string().url()).optional(),
  isPublic: z.boolean().optional()
})

export type SupplierRatingUpdateInput = z.infer<typeof SupplierRatingUpdateSchema>

// 評分查詢參數 Schema
export const SupplierRatingQuerySchema = z.object({
  supplierId: z.string().optional(),
  userId: z.string().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  hasComment: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'overallScore']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type SupplierRatingQuery = z.infer<typeof SupplierRatingQuerySchema>

// 評分統計回應
export interface SupplierRatingStats {
  averageRating: number
  totalRatings: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  dimensionAverages: {
    overallScore: number
    qualityScore?: number
    deliveryScore?: number
    serviceScore?: number
  }
  recentRatings: Array<{
    id: string
    overallScore: number
    comment: string | null
    createdAt: string
    user: {
      id: string
      name: string
    } | null
  }>
}

// API 回應類型
export interface SupplierRatingResponse {
  id: string
  supplierId: string
  userId: string
  orderId: string | null
  overallScore: number
  qualityScore: number
  deliveryScore: number
  serviceScore: number
  comment: string | null
  photoUrls: string[]
  isPublic: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  supplier?: {
    id: string
    companyName: string
  }
}

// 供應商評分摘要
export interface SupplierRatingSummary {
  supplierId: string
  companyName: string
  avgRating: number
  totalRatings: number
  onTimeDeliveryRate: number
  totalDeliveries: number
  recentRating?: {
    overallScore: number
    comment: string
    createdAt: string
  }
}