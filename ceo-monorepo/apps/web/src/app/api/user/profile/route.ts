import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthData } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    // 使用統一的認證 helper
    const authData = await getAuthData(request);
    
    if (!authData) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }
    
    const { userId, user: userFromSession } = authData;
    
    // 如果已經從 session 取得使用者資料，檢查是否需要查詢 member 資料
    let user = userFromSession;
    let memberData = null;

    // 如果還沒有使用者資料，從資料庫查詢（包含 member）
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          taxId: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          member: {
            select: {
              points: true,
              totalSpent: true,
              lastPurchaseAt: true,
            }
          }
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: '使用者不存在' },
          { status: 404 }
        );
      }
      
      memberData = user.member;
    } else {
      // 如果 user 是從 session 來的，需要單獨查詢 member 資料
      memberData = await prisma.member.findUnique({
        where: { userId },
        select: {
          points: true,
          totalSpent: true,
          lastPurchaseAt: true,
        }
      });
    }

    // 檢查使用者狀態
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '帳號已被停用，請聯絡管理員' },
        { status: 403 }
      );
    }

    // 準備回傳的使用者資料
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      taxId: user.taxId,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || null,
      lastLoginAt: user.lastLoginAt || null,
      member: memberData,
    };

    return NextResponse.json(
      { user: userData },
      { status: 200 }
    );

  } catch (error) {
    console.error('取得使用者資料錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}