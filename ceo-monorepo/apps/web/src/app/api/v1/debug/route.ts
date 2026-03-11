/**
 * 除錯 API 端點
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 測試 1: 簡單響應
    const simpleTest = { message: '除錯端點正常', timestamp: new Date().toISOString() };
    
    // 測試 2: 資料庫連接
    let dbTest = { connected: false, error: null };
    try {
      // 執行簡單查詢
      await prisma.$queryRaw`SELECT 1`;
      dbTest.connected = true;
    } catch (error: any) {
      dbTest.error = error.message;
    }
    
    // 測試 3: 供應商表是否存在
    let suppliersTest = { exists: false, count: 0, error: null };
    try {
      const count = await prisma.supplier.count();
      suppliersTest.exists = true;
      suppliersTest.count = count;
    } catch (error: any) {
      suppliersTest.error = error.message;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        simpleTest,
        dbTest,
        suppliersTest,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL ? '已設置' : '未設置'
        }
      }
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      data: null,
      error: {
        code: 'DEBUG_ERROR',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}