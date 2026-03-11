import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { NotificationIntegration } from '@/lib/notification-integration';

const CreateApplicationSchema = z.object({
  supplierId: z.string().min(1, '供應商 ID 必填'),
  companyName: z.string().min(1, '公司名稱必填'),
  contactPerson: z.string().min(1, '聯絡人必填'),
  phone: z.string().min(1, '電話必填'),
  businessLicense: z.string().optional(),
  note: z.string().optional(),
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'my';
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');

    let where: {
      applicantId?: string;
      supplier?: { mainAccountId: string };
      supplierId?: string;
      status?: string;
    } = {};

    if (type === 'my') {
      where.applicantId = session.user.id;
    } else if (type === 'pending') {
      where.supplier = {
        mainAccountId: session.user.id,
      };
      where.status = 'PENDING';
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status;
    }

    const applications = await prisma.supplierApplication.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            taxId: true,
            status: true,
          },
        },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            taxId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: applications.map(a => ({
        id: a.id,
        supplierId: a.supplierId,
        companyName: a.companyName,
        contactPerson: a.contactPerson,
        phone: a.phone,
        businessLicense: a.businessLicense,
        note: a.note,
        status: a.status,
        reviewedBy: a.reviewedBy,
        reviewedAt: a.reviewedAt,
        rejectionReason: a.rejectionReason,
        createdAt: a.createdAt,
        supplier: a.supplier,
        applicant: a.applicant,
      })),
    });

  } catch (error) {
    console.error('取得申請列表錯誤:', error);
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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: '請求體格式錯誤' },
        { status: 400 }
      );
    }

    const validationResult = CreateApplicationSchema.safeParse(body);
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

    const data = validationResult.data;

    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: '供應商不存在' },
        { status: 404 }
      );
    }

    if (supplier.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: '供應商目前不接受申請' },
        { status: 400 }
      );
    }

    const existingApplication = await prisma.supplierApplication.findFirst({
      where: {
        supplierId: data.supplierId,
        applicantId: session.user.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: '您已對此供應商提出申請，請勿重複申請' },
        { status: 400 }
      );
    }

    const application = await prisma.supplierApplication.create({
      data: {
        supplierId: data.supplierId,
        applicantId: session.user.id,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        phone: data.phone,
        businessLicense: data.businessLicense || '',
        note: data.note || '',
        status: 'PENDING',
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            mainAccountId: true,
          },
        },
      },
    });

    // 發送申請提交通知給申請者
    await NotificationIntegration.sendSupplierApplicationNotification(
      session.user.id,
      data.supplierId,
      application.id,
      'submitted'
    ).catch(console.error);

    // 發送申請通知給供應商主帳號（如果存在）
    if (application.supplier.mainAccountId) {
      await NotificationIntegration.sendSupplierApplicationNotification(
        application.supplier.mainAccountId,
        data.supplierId,
        application.id,
        'submitted'
      ).catch(console.error);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: application.id,
          supplierId: application.supplierId,
          companyName: application.companyName,
          contactPerson: application.contactPerson,
          phone: application.phone,
          status: application.status,
          createdAt: application.createdAt,
          supplier: application.supplier,
        },
        message: '申請提交成功，請等待供應商審批',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('提交申請錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
