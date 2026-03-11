import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const invoice = await prisma.supplierInvoice.findFirst({
      where: {
        id,
        supplierId: supplier.id,
      },
      include: {
        supplier: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '帳單不存在' },
        { status: 404 }
      );
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: '此帳單已繳納' },
        { status: 400 }
      );
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: '此帳單已取消' },
        { status: 400 }
      );
    }

    const account = invoice.supplier.account;
    if (!account) {
      return NextResponse.json(
        { success: false, error: '帳戶不存在' },
        { status: 404 }
      );
    }

    if (Number(account.balance) < Number(invoice.totalAmount)) {
      return NextResponse.json(
        { success: false, error: '餘額不足，請先儲值' },
        { status: 400 }
      );
    }

    const newBalance = Number(account.balance) - Number(invoice.totalAmount);

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
          type: 'MONTHLY_CHARGE',
          amount: -invoice.totalAmount,
          balanceBefore: account.balance,
          balanceAfter: newBalance,
          invoiceId: invoice.id,
          note: `繳納帳單 ${invoice.invoiceNo}`,
        },
      }),
      prisma.supplierInvoice.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        invoiceNo: invoice.invoiceNo,
        paidAmount: invoice.totalAmount,
        newBalance,
      },
      message: '帳單繳納成功',
    });

  } catch (error) {
    console.error('繳納帳單錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
