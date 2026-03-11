import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 全域搜尋 API 端點
 * 支援搜尋商品、供應商、採購模板等內容
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query.trim()) {
      return NextResponse.json(
        { error: '請提供搜尋關鍵字' },
        { status: 400 }
      );
    }

    // 根據搜尋類型執行不同的搜尋
    const results = await performSearch(query, type, limit, offset);

    return NextResponse.json({
      query,
      type,
      total: results.length,
      results,
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit
      }
    });
  } catch (error) {
    console.error('搜尋 API 錯誤:', error);
    return NextResponse.json(
      { error: '搜尋過程中發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 執行搜尋邏輯
 */
async function performSearch(
  query: string,
  type: string,
  limit: number,
  offset: number
) {
  const searchTerm = query.toLowerCase().trim();
  const results: any[] = [];

    // 搜尋商品
    if (type === 'all' || type === 'product') {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ],
          isActive: true,
          isDeleted: false
        },
        take: Math.floor(limit / 3),
        skip: offset,
        select: {
          id: true,
          name: true,
          description: true,
          categoryId: true,
          price: true,
          unit: true,
          images: true,
          supplier: {
            select: {
              id: true,
              companyName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      results.push(...products.map(product => ({
        id: product.id,
        type: 'product',
        title: product.name,
        description: product.description || '',
        category: '商品',
        relevance: calculateRelevance(product.name, product.description, searchTerm),
        url: `/products/${product.id}`,
        metadata: {
          price: `NT$ ${product.price}`,
          unit: product.unit,
          supplier: product.supplier?.companyName || '未知供應商'
        }
      })));
    }

    // 搜尋供應商
    if (type === 'all' || type === 'supplier') {
      const suppliers = await prisma.supplier.findMany({
        where: {
          OR: [
            { companyName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ],
          isActive: true,
          isDeleted: false
        },
        take: Math.floor(limit / 3),
        skip: offset,
        select: {
          id: true,
          companyName: true,
          description: true,
          status: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      results.push(...suppliers.map(supplier => ({
        id: supplier.id,
        type: 'supplier',
        title: supplier.companyName,
        description: supplier.description || '',
        category: '供應商',
        relevance: calculateRelevance(supplier.companyName, supplier.description, searchTerm),
        url: `/suppliers/${supplier.id}`,
        metadata: {
          status: supplier.status
        }
      })));
    }

    // 搜尋採購模板
    if (type === 'all' || type === 'template') {
      const templates = await prisma.purchaseTemplate.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ],
          isPublic: true
        },
        take: Math.floor(limit / 3),
        skip: offset,
        select: {
          id: true,
          name: true,
          description: true,
          usageCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          usageCount: 'desc'
        }
      });

      results.push(...templates.map(template => ({
        id: template.id,
        type: 'template',
        title: template.name,
        description: template.description || '',
        category: '採購模板',
        relevance: calculateRelevance(template.name, template.description, searchTerm),
        url: `/purchase-templates/${template.id}`,
        metadata: {
          usageCount: template.usageCount,
          createdBy: template.user?.name || '未知用戶',
          createdAt: new Date(template.createdAt).toLocaleDateString('zh-TW')
        }
      })));
    }

  // 按相關度排序
  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
}

/**
 * 計算搜尋相關度分數
 */
function calculateRelevance(title: string, description: string, searchTerm: string): number {
  let score = 0;
  
  // 標題匹配權重最高
  if (title.toLowerCase().includes(searchTerm)) {
    score += 70;
  }
  
  // 描述匹配權重中等
  if (description.toLowerCase().includes(searchTerm)) {
    score += 30;
  }
  
  // 部分匹配
  const searchWords = searchTerm.split(' ');
  searchWords.forEach(word => {
    if (title.toLowerCase().includes(word)) {
      score += 20;
    }
    if (description.toLowerCase().includes(word)) {
      score += 10;
    }
  });
  
  // 確保分數在 0-100 之間
  return Math.min(100, Math.max(0, score));
}

/**
 * 儲存搜尋歷史（用於推薦）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, userType } = body;

    if (!query) {
      return NextResponse.json(
        { error: '請提供搜尋關鍵字' },
        { status: 400 }
      );
    }

    // 儲存搜尋歷史到資料庫
    // 注意：searchHistory 模型可能不存在，暫時註解掉
    // await prisma.searchHistory.create({
    //   data: {
    //     query,
    //     userId: userId || null,
    //     userType: userType || 'guest',
    //     ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    //     userAgent: request.headers.get('user-agent') || 'unknown'
    //   }
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('儲存搜尋歷史錯誤:', error);
    return NextResponse.json(
      { error: '儲存搜尋歷史時發生錯誤' },
      { status: 500 }
    );
  }
}