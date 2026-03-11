export interface Recommendation {
  id: string;
  userId: string;
  productId: string;
  supplierId?: string;
  score: number;
  reason?: string;
  algorithm: string;
  viewed: boolean;
  clicked: boolean;
  dismissed: boolean;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  clickedAt?: string;
  dismissedAt?: string;
  
  // 關聯數據
  product: {
    id: string;
    name: string;
    subtitle?: string;
    description?: string;
    image?: string;
    unit?: string;
    spec?: string;
    popularityScore: number;
    purchaseCount: number;
    lastPurchasedAt?: string;
    priceTiers?: Array<{
      id: string;
      minQty: number;
      price: number;
    }>;
  };
  
  supplier?: {
    id: string;
    companyName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    avgRating: number;
    totalRatings: number;
    onTimeDeliveryRate: number;
    totalDeliveries: number;
  };
  
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface RecommendationStats {
  totalRecommendations: number;
  viewedRecommendations: number;
  clickedRecommendations: number;
  clickThroughRate: number;
  algorithmStats: Array<{
    algorithm: string;
    count: number;
    avgScore: number;
  }>;
}

export interface GenerateRecommendationsRequest {
  userId?: string;
  algorithm: 'POPULARITY' | 'HISTORY' | 'COLLABORATIVE' | 'HYBRID';
  limit: number;
  forceRegenerate: boolean;
}

export interface GenerateRecommendationsResponse {
  success: boolean;
  data: {
    userId: string;
    generatedCount: number;
    algorithm: string;
    recommendations: Array<{
      productId: string;
      supplierId?: string;
      score: number;
      reason: string;
    }>;
  };
  message: string;
}

export interface RecommendationActionRequest {
  action: 'view' | 'click' | 'dismiss' | 'reset';
  note?: string;
}

export interface RecommendationFilters {
  algorithm?: string;
  viewed?: boolean;
  limit?: number;
  offset?: number;
}