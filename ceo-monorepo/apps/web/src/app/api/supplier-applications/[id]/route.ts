import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { NotificationIntegration } from '@/lib/notification-integration';
import { auditLogger } from '@/lib/audit-logger';

const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

export async function PATCH(
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

    const { id } = await params;

    const application = await prisma.supplierApplication.findUnique({
      where: { id },
      include: {
        supplier: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: '申請不存在' },
        { status: 404 }
      );
    }

    if (application.supplier.mainAccountId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '您無權審批此申請' },
        { status: 403 }
      );
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: '此申請已經被處理過了' },
        { status: 400 }
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

    const validationResult = ReviewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: '無效的操作類型' },
        { status: 400 }
      );
    }

    const { action, reason } = validationResult.data;

    let updateData: {
      reviewedBy: string;
      reviewedAt: Date;
      status?: 'APPROVED' | 'REJECTED';
      rejectionReason?: string;
    } = {
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    };

    let message = '';

    if (action === 'approve') {
      updateData.status = 'APPROVED';
      message = '申請已批准';
    } else {
      updateData.status = 'REJECTED';
      updateData.rejectionReason = reason || '不符合供應商要求';
      message = '申請已拒絕';
    }

    // 使用事務確保原子性（批准時同時建立 UserSupplier）
    const updated = await prisma.$transaction(async (tx) => {
      if (action === 'approve') {
        await tx.userSupplier.create({
          data: {
            userId: application.applicantId,
            supplierId: application.supplierId,
            role: 'SUB_ACCOUNT',
            isActive: true,
          },
        });
      }

      return tx.supplierApplication.update({
        where: { id },
        data: updateData,
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    auditLogger.supplierAction(
      action === 'approve' ? 'SUPPLIER_APPLICATION_APPROVE' : 'SUPPLIER_APPLICATION_REJECT',
      application.supplierId,
      application.id,
      { applicantId: application.applicantId, reviewedBy: session.user.id }
    );

    // 發送審核結果通知給申請者
    await NotificationIntegration.sendSupplierApplicationNotification(
      application.applicantId,
      application.supplierId,
      application.id,
      action === 'approve' ? 'approved' : 'rejected'
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewedAt,
        rejectionReason: updated.rejectionReason,
        applicant: updated.applicant,
      },
      message,
    });

  } catch (error) {
    console.error('審批申請錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
