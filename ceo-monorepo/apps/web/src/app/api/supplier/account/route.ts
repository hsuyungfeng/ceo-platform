import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const DepositSchema = z.object({
  amount: z.number().positive('金額必須為正數').max(1000000, '單次儲值最高 NT$ 1,000,000'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    }

    const supplier = await prisma.supplier.findFirst({
      where: {
        mainAccountId: session.user.id,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: '您還不是供應商' },
        { status: 404 }
      );
    }

    const account = await prisma.supplierAccount.findUnique({
      where: { supplierId: supplier.id },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: '帳戶不存在' },
        { status: 404 }
      );
    }

    const isLowBalance = Number(account.balance) < 1000;

    return NextResponse.json({
      success: true,
      data: {
        supplierId: account.supplierId,
        balance: account.balance,
        totalSpent: account.totalSpent,
        creditLimit: account.creditLimit,
        billingRate: account.billingRate,
        lastPaymentAt: account.lastPaymentAt,
        paymentDueDate: account.paymentDueDate,
        isSuspended: account.isSuspended,
        suspendedAt: account.suspendedAt,
        suspendReason: account.suspendReason,
        isLowBalance,
      },
    });

  } catch (error) {
    console.error('取得供應商帳戶錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    }

    const supplier = await prisma.supplier.findFirst({
      where: {
        mainAccountId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: '您還不是供應商或供應商狀態異常' },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: '請求體格式錯誤' },
        { status: 400 }
      );
    }

    const validationResult = DepositSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, error: '數據驗證失敗', errors },
        { status: 400 }
      );
    }

    const { amount } = validationResult.data;

    const account = await prisma.supplierAccount.findUnique({
      where: { supplierId: supplier.id },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: '帳戶不存在' },
        { status: 404 }
      );
    }

    if (account.isSuspended) {
      return NextResponse.json(
        { success: false, error: '帳號已被停權，無法儲值' },
        { status: 403 }
      );
    }

    const newBalance = Number(account.balance) + amount;

    await prisma.$transaction([
      prisma.supplierAccount.update({
        where: { supplierId: supplier.id },
        data: {
          balance: newBalance,
          lastPaymentAt: new Date(),
        },
      }),
      prisma.supplierTransaction.create({
        data: {
          supplierId: supplier.id,
          type: 'DEPOSIT',
          amount: amount,
          balanceBefore: account.balance,
          balanceAfter: newBalance,
          note: '儲值',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        balance: newBalance,
        amount,
      },
      message: `儲值 NT$ ${amount.toLocaleString()} 成功`,
    });

  } catch (error) {
    console.error('儲值錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
