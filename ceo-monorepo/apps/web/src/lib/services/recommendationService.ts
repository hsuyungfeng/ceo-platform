import { prisma } from '@/lib/prisma';

export interface GenerateRecommendationsOptions {
  userId?: string;
  algorithm?: 'POPULARITY' | 'HISTORY' | 'COLLABORATIVE' | 'HYBRID';
  limit?: number;
  forceRegenerate?: boolean;
}

export interface RecommendationResult {
  userId: string;
  generatedCount: number;
  algorithm: string;
  recommendations: Array<{
    productId: string;
    supplierId?: string;
    score: number;
    reason: string;
  }>;
}

/**
 * 生成採購推薦
 */
export async function generateRecommendations(
  options: GenerateRecommendationsOptions
): Promise<RecommendationResult> {
  const {
    userId,
    algorithm = 'HYBRID',
    limit = 10,
    forceRegenerate = false
  } = options;
  
  // 如果指定了單個用戶
  if (userId) {
    return generateUserRecommendations(userId, algorithm, limit, forceRegenerate);
  }
  
  // 為所有活躍用戶生成推薦（批次處理）
  return generateBatchRecommendations(algorithm, limit);
}

/**
 * 為單個用戶生成推薦
 */
async function generateUserRecommendations(
  userId: string,
  algorithm: string,
  limit: number,
  forceRegenerate: boolean
): Promise<RecommendationResult> {
  // 檢查用戶是否存在
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      userPurchaseHistories: {
        orderBy: { lastPurchasedAt: 'desc' },
        take: 50
      }
    }
  });
  
  if (!user) {
    throw new Error(`用戶 ${userId} 不存在`);
  }
  
  // 如果不需要強制重新生成，檢查現有推薦是否足夠新（最近7天內）
  if (!forceRegenerate) {
    const recentRecommendations = await prisma.purchaseRecommendation.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天內
        },
        dismissed: false
      }
    });
    
    if (recentRecommendations >= limit * 0.7) {
      // 已有足夠新的推薦，返回現有推薦
      const existingRecommendations = await prisma.purchaseRecommendation.findMany({
        where: {
          userId,
          dismissed: false,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { score: 'desc' },
        take: limit
      });
      
      return {
        userId,
        generatedCount: existingRecommendations.length,
        algorithm: 'EXISTING',
        recommendations: existingRecommendations.map(rec => ({
          productId: rec.productId,
          supplierId: rec.supplierId || undefined,
          score: rec.score,
          reason: rec.reason || '現有推薦'
        }))
      };
    }
  }
  
  // 根據算法生成推薦
  let recommendations: Array<{
    productId: string;
    supplierId?: string;
    score: number;
    reason: string;
  }> = [];
  
  switch (algorithm) {
    case 'POPULARITY':
      recommendations = await generatePopularityRecommendations(userId, limit);
      break;
    case 'HISTORY':
      recommendations = await generateHistoryBasedRecommendations(userId, limit);
      break;
    case 'COLLABORATIVE':
      recommendations = await generateCollaborativeRecommendations(userId, limit);
      break;
    case 'HYBRID':
    default:
      // 混合算法：結合多種推薦策略
      const [popularityRecs, historyRecs] = await Promise.all([
        generatePopularityRecommendations(userId, Math.ceil(limit * 0.4)),
        generateHistoryBasedRecommendations(userId, Math.ceil(limit * 0.4))
      ]);
      
      // 合併並去重
      const allRecs = [...popularityRecs, ...historyRecs];
      const uniqueRecs = new Map();
      
      allRecs.forEach(rec => {
        const key = `${rec.productId}-${rec.supplierId || 'no-supplier'}`;
        if (!uniqueRecs.has(key) || uniqueRecs.get(key).score < rec.score) {
          uniqueRecs.set(key, rec);
        }
      });
      
      recommendations = Array.from(uniqueRecs.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
      // 如果推薦數量不足，補充熱門推薦
      if (recommendations.length < limit) {
        const additionalRecs = await generatePopularityRecommendations(
          userId, 
          limit - recommendations.length,
          recommendations.map(r => r.productId)
        );
        recommendations.push(...additionalRecs);
      }
      break;
  }
  
  // 保存推薦到數據庫
  const savedRecommendations = await Promise.all(
    recommendations.map(rec => 
      prisma.purchaseRecommendation.create({
        data: {
          userId,
          productId: rec.productId,
          supplierId: rec.supplierId,
          score: rec.score,
          reason: rec.reason,
          algorithm,
          viewed: false,
          clicked: false,
          dismissed: false
        }
      })
    )
  );
  
  return {
    userId,
    generatedCount: savedRecommendations.length,
    algorithm,
    recommendations: savedRecommendations.map(rec => ({
      productId: rec.productId,
      supplierId: rec.supplierId || undefined,
      score: rec.score,
      reason: rec.reason || `${algorithm}推薦`
    }))
  };
}

/**
 * 基於熱門度的推薦算法
 */
export async function generatePopularityRecommendations(
  userId: string,
  limit: number,
  excludeProductIds: string[] = []
): Promise<Array<{ productId: string; supplierId?: string; score: number; reason: string }>> {
  // 查詢熱門產品（基於購買次數和熱門度分數）
  const popularProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(excludeProductIds.length > 0 && {
        id: { notIn: excludeProductIds }
      })
    },
    include: {
      priceTiers: {
        orderBy: { minQty: 'asc' },
        take: 1
      },
      supplierProducts: {
        where: { isActive: true },
        include: {
          supplier: true
        },
        take: 1 // 每個產品取一個供應商
      }
    },
    orderBy: [
      { purchaseCount: 'desc' },
      { popularityScore: 'desc' },
      { totalSold: 'desc' }
    ],
    take: limit * 2 // 取多些以便過濾
  });
  
  // 過濾出有供應商的產品，並計算推薦分數
  const recommendations = popularProducts
    .filter(product => product.supplierProducts.length > 0)
    .slice(0, limit)
    .map(product => {
      const supplierProduct = product.supplierProducts[0];
      const popularityScore = product.popularityScore || 0;
      const purchaseCount = product.purchaseCount || 0;
      
      // 計算綜合分數（0-1）
      let score = popularityScore;
      if (purchaseCount > 0) {
        // 根據購買次數調整分數（log縮放）
        const purchaseFactor = Math.log10(purchaseCount + 1) / 3; // 最大約1.0
        score = score * 0.7 + purchaseFactor * 0.3;
      }
      
      // 確保分數在合理範圍
      score = Math.min(Math.max(score, 0.1), 0.95);
      
      return {
        productId: product.id,
        supplierId: supplierProduct.supplierId,
        score,
        reason: `熱門產品：${product.name}（購買次數：${purchaseCount}）`
      };
    });
  
  return recommendations;
}

/**
 * 基於用戶歷史的推薦算法
 */
export async function generateHistoryBasedRecommendations(
  userId: string,
  limit: number
): Promise<Array<{ productId: string; supplierId?: string; score: number; reason: string }>> {
  // 獲取用戶的購買歷史
  const purchaseHistory = await prisma.userPurchaseHistory.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          supplierProducts: {
            where: { isActive: true },
            include: { supplier: true }
          }
        }
      }
    },
    orderBy: { lastPurchasedAt: 'desc' },
    take: 50
  });
  
  if (purchaseHistory.length === 0) {
    return []; // 沒有歷史記錄，無法生成基於歷史的推薦
  }
  
  // 分析用戶購買的產品類別
  const categoryCounts = new Map<string, number>();
  purchaseHistory.forEach(history => {
    if (history.product.category) {
      const categoryId = history.product.category.id;
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + history.totalQuantity);
    }
  });
  
  // 找出用戶最常購買的類別
  const topCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryId]) => categoryId);
  
  // 查詢同類別的熱門產品（排除用戶已購買的）
  const purchasedProductIds = purchaseHistory.map(h => h.productId);
  
  const similarProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: { in: topCategories },
      id: { notIn: purchasedProductIds },
      purchaseCount: { gt: 0 } // 至少有人購買過
    },
    include: {
      category: true,
      priceTiers: {
        orderBy: { minQty: 'asc' },
        take: 1
      },
      supplierProducts: {
        where: { isActive: true },
        include: { supplier: true },
        take: 1
      }
    },
    orderBy: [
      { purchaseCount: 'desc' },
      { popularityScore: 'desc' }
    ],
    take: limit
  });
  
  // 計算推薦分數
  const recommendations = similarProducts
    .filter(product => product.supplierProducts.length > 0)
    .map(product => {
      const supplierProduct = product.supplierProducts[0];
      const categoryMatch = topCategories.includes(product.categoryId || '') ? 0.3 : 0;
      const purchaseCount = product.purchaseCount || 0;
      
      // 分數計算：基礎分數 + 類別匹配加成 + 購買次數加成
      let score = (product.popularityScore || 0.3) * 0.5;
      score += categoryMatch;
      score += Math.log10(purchaseCount + 1) / 4; // 購買次數加成
      
      // 確保分數在合理範圍
      score = Math.min(Math.max(score, 0.2), 0.9);
      
      return {
        productId: product.id,
        supplierId: supplierProduct.supplierId,
        score,
        reason: `與您常購買的${product.category?.name || '產品'}類似`
      };
    });
  
  return recommendations;
}

/**
 * 協同過濾推薦算法（簡單實現）
 */
async function generateCollaborativeRecommendations(
  userId: string,
  limit: number
): Promise<Array<{ productId: string; supplierId?: string; score: number; reason: string }>> {
  // 簡化版本：查找有相似購買記錄的用戶
  // 實際實現可能需要更複雜的算法
  
  // 獲取當前用戶的購買產品
  const userPurchases = await prisma.userPurchaseHistory.findMany({
    where: { userId },
    select: { productId: true }
  });
  
  if (userPurchases.length === 0) {
    return [];
  }
  
  const userProductIds = userPurchases.map(p => p.productId);
  
  // 查找也購買了這些產品的其他用戶
  // 先獲取所有購買了相同產品的用戶
  const allSimilarUsers = await prisma.userPurchaseHistory.groupBy({
    by: ['userId'],
    where: {
      productId: { in: userProductIds },
      userId: { not: userId },
      totalQuantity: { gt: 0 }
    },
    _count: {
      productId: true
    }
  });
  
  // 過濾出至少共同購買了指定數量的用戶
  const minCommonProducts = Math.min(2, userProductIds.length * 0.3);
  const similarUsers = allSimilarUsers.filter(
    user => (user._count?.productId || 0) > minCommonProducts
  );
  
  if (similarUsers.length === 0) {
    return [];
  }
  
  const similarUserIds = similarUsers.map(u => u.userId);
  
  // 獲取相似用戶購買但當前用戶未購買的產品
  const recommendedProducts = await prisma.userPurchaseHistory.findMany({
    where: {
      userId: { in: similarUserIds },
      productId: { notIn: userProductIds },
      totalQuantity: { gt: 0 }
    },
    include: {
      product: {
        include: {
          supplierProducts: {
            where: { isActive: true },
            include: { supplier: true },
            take: 1
          }
        }
      }
    },
    orderBy: { totalQuantity: 'desc' },
    take: limit
  });
  
  // 計算推薦分數
  const productScores = new Map<string, { productId: string; supplierId?: string; score: number; reason: string }>();
  
  recommendedProducts.forEach(history => {
    if (history.product.supplierProducts.length === 0) return;
    
    const supplierProduct = history.product.supplierProducts[0];
    const key = `${history.productId}-${supplierProduct.supplierId}`;
    
    // 分數基於購買次數和產品熱門度
    let score = Math.log10(history.totalQuantity + 1) / 3; // 0-1範圍
    score += (history.product.popularityScore || 0) * 0.3;
    
    if (!productScores.has(key) || productScores.get(key)!.score < score) {
      productScores.set(key, {
        productId: history.productId,
        supplierId: supplierProduct.supplierId,
        score: Math.min(score, 0.85),
        reason: `與您有相似購買記錄的用戶也購買了此產品`
      });
    }
  });
  
  return Array.from(productScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 批次為所有活躍用戶生成推薦
 */
async function generateBatchRecommendations(
  algorithm: string,
  limit: number
): Promise<RecommendationResult> {
  // 獲取最近30天內有活動的用戶
  const activeUsers = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      lastLoginAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    select: { id: true },
    take: 100 // 限制批次大小
  });
  
  let totalGenerated = 0;
  
  // 為每個活躍用戶生成推薦
  for (const user of activeUsers) {
    try {
      const result = await generateUserRecommendations(
        user.id,
        algorithm,
        limit,
        false
      );
      totalGenerated += result.generatedCount;
    } catch (error) {
      console.error(`為用戶 ${user.id} 生成推薦失敗:`, error);
      // 繼續處理其他用戶
    }
  }
  
  return {
    userId: 'BATCH',
    generatedCount: totalGenerated,
    algorithm,
    recommendations: [] // 批次處理不返回具體推薦
  };
}

/**
 * 更新產品熱門度分數
 */
export async function updateProductPopularity() {
  // 計算每個產品的熱門度分數
  const products = await prisma.product.findMany({
    include: {
      orderItems: {
        where: {
          order: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
            }
          }
        }
      }
    }
  });
  
  for (const product of products) {
    // 計算購買次數和總銷量
    const purchaseCount = product.orderItems.length;
    const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // 計算熱門度分數（0-1）
    let popularityScore = 0;
    
    if (purchaseCount > 0) {
      // 基礎分數：購買次數（log縮放）
      const purchaseScore = Math.log10(purchaseCount + 1) / 3; // 最大約1.0
      
      // 銷量分數：總銷量（log縮放）
      const salesScore = Math.log10(totalSold + 1) / 4; // 最大約0.75
      
      // 時間衰減：最近購買加成
      const recentPurchaseBonus = purchaseCount > 5 ? 0.1 : 0;
      
      popularityScore = purchaseScore * 0.6 + salesScore * 0.3 + recentPurchaseBonus * 0.1;
      
      // 確保分數在0-1範圍內
      popularityScore = Math.min(Math.max(popularityScore, 0), 0.95);
    }
    
    // 更新產品
    await prisma.product.update({
      where: { id: product.id },
      data: {
        popularityScore,
        purchaseCount,
        totalSold,
        lastPurchasedAt: purchaseCount > 0 ? new Date() : product.lastPurchasedAt
      }
    });
  }
  
  console.log(`已更新 ${products.length} 個產品的熱門度分數`);
}

/**
 * 更新用戶採購歷史聚合表
 */
export async function updateUserPurchaseHistory() {
  // 這應該作為定期任務運行，聚合用戶的購買數據
  console.log('更新用戶採購歷史功能待實現');
}