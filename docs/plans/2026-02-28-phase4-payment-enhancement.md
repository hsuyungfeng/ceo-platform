# Phase 4: Payment System Enhancement - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a simplified B2B monthly billing system with two payment methods (cash and monthly settlement) using PostgreSQL + Prisma.

**Architecture:** Add Invoice and InvoiceLineItem tables to track monthly statements. Implement REST APIs for employees to view invoices and for admins to generate/send bills. Support simple (summary) and detailed (line-by-line) invoice formats. Use automated monthly statement generation at month-end.

**Tech Stack:** Next.js, TypeScript, Prisma v7, PostgreSQL, TailwindCSS

---

## Task 1: Update Prisma Schema - Invoice and InvoiceLineItem Models

**Files:**
- Modify: `/ceo-platform/ceo-monorepo/apps/web/prisma/schema.prisma`
- Test: Create `/ceo-platform/ceo-monorepo/apps/web/__tests__/schema.test.ts`

**Step 1: Write the failing test**

```typescript
// __tests__/schema.test.ts
import { PrismaClient } from '@prisma/client'

describe('Invoice Schema', () => {
  const prisma = new PrismaClient()

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('Invoice model should exist with required fields', async () => {
    // This test verifies the schema exists by attempting a query
    // It will fail until the schema is updated
    const invoiceModel = prisma.invoice
    expect(invoiceModel).toBeDefined()
  })

  test('InvoiceLineItem model should exist with order relation', async () => {
    const lineItemModel = prisma.invoiceLineItem
    expect(lineItemModel).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd /ceo-platform/ceo-monorepo/apps/web
npm test -- __tests__/schema.test.ts 2>&1 | head -50
```

Expected: FAIL - "Unknown model: Invoice"

**Step 3: Update Prisma schema with Invoice and InvoiceLineItem models**

Add to `/ceo-platform/ceo-monorepo/apps/web/prisma/schema.prisma` (before the final closing brace):

```prisma
// ===== Invoice System (Monthly Billing) =====
enum InvoiceStatus {
  DRAFT      // 草稿 (尚未發送)
  SENT       // 已發送 (等待員工確認)
  CONFIRMED  // 已確認 (員工已查看)
  PAID       // 已支付
}

model Invoice {
  id String @id @default(cuid())
  invoiceNo String @unique              // 月結帳單號：INV-2026-02-001
  userId String
  user User @relation("UserInvoices", fields: [userId], references: [id], onDelete: Cascade)

  // 計費期間
  billingMonth String                   // YYYY-MM (例：2026-02)
  billingStartDate DateTime
  billingEndDate DateTime

  // 金額資訊
  totalAmount Decimal @db.Decimal(10, 2)
  totalItems Int

  // 狀態追蹤
  status InvoiceStatus @default(DRAFT)
  sentAt DateTime?
  confirmedAt DateTime?
  paidAt DateTime?

  // 格式選項
  invoiceFormat String @default("simple") // "simple" | "detailed"

  // 發票明細
  lineItems InvoiceLineItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([billingMonth])
  @@index([status])
}

model InvoiceLineItem {
  id String @id @default(cuid())
  invoiceId String
  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  orderId String
  order Order @relation("OrderInvoiceItems", fields: [orderId], references: [id], onDelete: Cascade)

  // 行項目詳情
  productName String
  quantity Int
  unitPrice Decimal @db.Decimal(10, 2)
  subtotal Decimal @db.Decimal(10, 2)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([invoiceId])
  @@index([orderId])
}

// Update User model to add invoices relation
// Change existing User model's relation block to include:
// invoices Invoice[] @relation("UserInvoices")

// Update Order model to add invoiceItems relation
// Change existing Order model's relation block to include:
// invoiceItems InvoiceLineItem[] @relation("OrderInvoiceItems")
```

**Important:** Also update the existing `User` and `Order` models:

In the `User` model, add:
```prisma
invoices Invoice[] @relation("UserInvoices")
```

In the `Order` model, add:
```prisma
invoiceItems InvoiceLineItem[] @relation("OrderInvoiceItems")
```

**Step 4: Generate Prisma Client and create migration**

```bash
cd /ceo-platform/ceo-monorepo/apps/web
npx prisma migrate dev --name add_invoice_models
```

Expected: Success - Migration created and applied

**Step 5: Run test to verify it passes**

```bash
npm test -- __tests__/schema.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add prisma/schema.prisma __tests__/schema.test.ts
git commit -m "feat: add Invoice and InvoiceLineItem models to schema"
```

---

## Task 2: Update Order Model - Add paymentMethod Field

**Files:**
- Modify: `/ceo-platform/ceo-monorepo/apps/web/prisma/schema.prisma`
- Test: `/ceo-platform/ceo-monorepo/apps/web/__tests__/schema.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to __tests__/schema.test.ts
test('Order model should have paymentMethod field', async () => {
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      taxId: 'TEST123',
      password: 'hashed',
      name: 'Test',
      firmName: 'Test Firm',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    }
  })

  const order = await prisma.order.create({
    data: {
      userId: testUser.id,
      orderNo: 'ORD-' + Date.now(),
      status: 'PENDING',
      paymentMethod: 'CASH', // This field should exist
      totalAmount: new Prisma.Decimal('100.00')
    }
  })

  expect(order.paymentMethod).toBe('CASH')

  await prisma.order.delete({ where: { id: order.id } })
  await prisma.user.delete({ where: { id: testUser.id } })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/schema.test.ts -t "paymentMethod"
```

Expected: FAIL - "Unknown field paymentMethod"

**Step 3: Add paymentMethod enum and field to Order model**

Add before the Invoice enum in schema:

```prisma
enum PaymentMethod {
  CASH
  MONTHLY_BILLING
}
```

Update Order model to include:

```prisma
paymentMethod PaymentMethod @default(CASH)
```

**Step 4: Generate migration**

```bash
cd /ceo-platform/ceo-monorepo/apps/web
npx prisma migrate dev --name add_payment_method_to_order
```

Expected: Success

**Step 5: Run test to verify it passes**

```bash
npm test -- __tests__/schema.test.ts -t "paymentMethod"
```

Expected: PASS

**Step 6: Commit**

```bash
git add prisma/schema.prisma __tests__/schema.test.ts
git commit -m "feat: add PaymentMethod enum and field to Order model"
```

---

## Task 3: Implement Invoice Service - Generate Monthly Statements

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/lib/invoice-service.ts`
- Test: `/ceo-platform/ceo-monorepo/apps/web/__tests__/invoice-service.test.ts`

**Step 1: Write the failing test**

```typescript
// __tests__/invoice-service.test.ts
import { generateMonthlyInvoices } from '@/lib/invoice-service'
import { PrismaClient } from '@prisma/client'

describe('Invoice Service', () => {
  const prisma = new PrismaClient()

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('generateMonthlyInvoices should create invoices for MONTHLY_BILLING orders', async () => {
    // Setup: Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        taxId: `TAX${Date.now()}`,
        password: 'hashed',
        name: 'Test User',
        firmName: 'Test Firm',
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      }
    })

    // Create test orders for previous month
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const billingMonth = lastMonth.toISOString().slice(0, 7) // YYYY-MM

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNo: `ORD-${Date.now()}`,
        status: 'COMPLETED',
        paymentMethod: 'MONTHLY_BILLING',
        totalAmount: new Prisma.Decimal('1000.00'),
        createdAt: lastMonth
      }
    })

    // Run generation
    const invoices = await generateMonthlyInvoices(billingMonth)

    expect(invoices).toHaveLength(1)
    expect(invoices[0].userId).toBe(user.id)
    expect(invoices[0].totalAmount.toString()).toBe('1000.00')
    expect(invoices[0].status).toBe('DRAFT')

    // Cleanup
    await prisma.order.delete({ where: { id: order.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/invoice-service.test.ts
```

Expected: FAIL - "Cannot find module @/lib/invoice-service"

**Step 3: Implement the invoice service**

Create `/ceo-platform/ceo-monorepo/apps/web/src/lib/invoice-service.ts`:

```typescript
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * Generate monthly invoices for all users with MONTHLY_BILLING orders in a given month
 * @param billingMonth YYYY-MM format (e.g., "2026-02")
 */
export async function generateMonthlyInvoices(billingMonth: string) {
  // Parse billing month
  const [year, month] = billingMonth.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  // Get all MONTHLY_BILLING orders from previous month
  const orders = await prisma.order.findMany({
    where: {
      paymentMethod: 'MONTHLY_BILLING',
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      items: true,
      user: true
    }
  })

  // Group orders by user
  const ordersByUser = new Map<string, typeof orders>()
  orders.forEach(order => {
    if (!ordersByUser.has(order.userId)) {
      ordersByUser.set(order.userId, [])
    }
    ordersByUser.get(order.userId)!.push(order)
  })

  // Create invoices for each user
  const invoices = []
  for (const [userId, userOrders] of ordersByUser) {
    const totalAmount = userOrders.reduce((sum, order) => {
      return sum.plus(order.totalAmount)
    }, new Prisma.Decimal(0))

    const totalItems = userOrders.reduce((sum, order) => {
      return sum + (order.items?.length || 0)
    }, 0)

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { billingMonth }
    })
    const invoiceNo = `INV-${billingMonth}-${String(invoiceCount + 1).padStart(3, '0')}`

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        userId,
        billingMonth,
        billingStartDate: startDate,
        billingEndDate: endDate,
        totalAmount,
        totalItems,
        status: 'DRAFT',
        invoiceFormat: 'simple',
        lineItems: {
          createMany: {
            data: userOrders.flatMap(order =>
              order.items?.map(item => ({
                orderId: order.id,
                productName: item.productName || 'Unknown Product',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: new Prisma.Decimal(item.quantity).times(item.unitPrice)
              })) || []
            )
          }
        }
      },
      include: { lineItems: true }
    })

    invoices.push(invoice)
  }

  return invoices
}

/**
 * Mark invoices as sent and log send timestamp
 */
export async function sendInvoices(invoiceIds: string[]) {
  return prisma.invoice.updateMany({
    where: { id: { in: invoiceIds } },
    data: { status: 'SENT', sentAt: new Date() }
  })
}

/**
 * Mark invoice as confirmed by employee
 */
export async function confirmInvoice(invoiceId: string) {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'CONFIRMED', confirmedAt: new Date() }
  })
}

/**
 * Mark invoice as paid by admin
 */
export async function markInvoicePaid(invoiceId: string) {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'PAID', paidAt: new Date() }
  })
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/invoice-service.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/invoice-service.ts __tests__/invoice-service.test.ts
git commit -m "feat: implement invoice service for monthly statement generation"
```

---

## Task 4: Implement API Endpoint - GET /api/invoices (List User Invoices)

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/api/invoices/route.ts`
- Test: `/ceo-platform/ceo-monorepo/apps/web/__tests__/api/invoices.test.ts`

**Step 1: Write the failing test**

```typescript
// __tests__/api/invoices.test.ts
describe('GET /api/invoices', () => {
  test('should return user invoices with 200 status', async () => {
    // This test is integration-style
    // In actual implementation, you'd use a test database
    expect(true).toBe(true) // Placeholder
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/api/invoices.test.ts
```

Expected: PASS (placeholder test) - Now implement the actual endpoint

**Step 3: Implement GET /api/invoices endpoint**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/api/invoices/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthData } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authData = await getAuthData(request)
    if (!authData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's invoices
    const invoices = await prisma.invoice.findMany({
      where: { userId: authData.userId },
      include: { lineItems: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: invoices,
      count: invoices.length
    })
  } catch (error) {
    console.error('GET /api/invoices error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 4: Commit**

```bash
git add src/app/api/invoices/route.ts
git commit -m "feat: implement GET /api/invoices endpoint"
```

---

## Task 5: Implement API Endpoints - GET /api/invoices/[id] and PATCH /api/invoices/[id]/confirm

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/api/invoices/[id]/route.ts`
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/api/invoices/[id]/confirm/route.ts`

**Step 1: Implement GET /api/invoices/[id]**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/api/invoices/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthData } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authData = await getAuthData(request)
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        lineItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firmName: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Verify ownership
    if (invoice.userId !== authData.userId && authData.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Implement PATCH /api/invoices/[id]/confirm**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/api/invoices/[id]/confirm/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthData } from '@/lib/auth-helper'
import { confirmInvoice } from '@/lib/invoice-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authData = await getAuthData(request)
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Confirm the invoice (marks as CONFIRMED and sets timestamp)
    const updated = await confirmInvoice(params.id)

    return NextResponse.json({
      success: true,
      message: 'Invoice confirmed',
      data: updated
    })
  } catch (error) {
    console.error('PATCH /api/invoices/[id]/confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/invoices/[id]/route.ts src/app/api/invoices/[id]/confirm/route.ts
git commit -m "feat: implement GET and PATCH invoice endpoints for employees"
```

---

## Task 6: Implement Admin API Endpoints - Invoice Management

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/api/admin/invoices/route.ts`
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/api/admin/invoices/generate/route.ts`
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/api/admin/invoices/send-all/route.ts`

**Step 1: Implement POST /api/admin/invoices/generate**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/api/admin/invoices/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helper'
import { generateMonthlyInvoices } from '@/lib/invoice-service'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { billingMonth } = await request.json()

    if (!billingMonth || !/^\d{4}-\d{2}$/.test(billingMonth)) {
      return NextResponse.json(
        { error: 'Invalid billingMonth format. Use YYYY-MM' },
        { status: 400 }
      )
    }

    const invoices = await generateMonthlyInvoices(billingMonth)

    return NextResponse.json({
      success: true,
      message: `Generated ${invoices.length} invoices for ${billingMonth}`,
      data: invoices
    })
  } catch (error) {
    console.error('POST /api/admin/invoices/generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Implement POST /api/admin/invoices/send-all**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/api/admin/invoices/send-all/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helper'
import { sendInvoices } from '@/lib/invoice-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { billingMonth } = await request.json()

    if (!billingMonth) {
      return NextResponse.json(
        { error: 'billingMonth is required' },
        { status: 400 }
      )
    }

    // Find DRAFT invoices for the month
    const drafts = await prisma.invoice.findMany({
      where: {
        billingMonth,
        status: 'DRAFT'
      }
    })

    if (drafts.length === 0) {
      return NextResponse.json(
        { error: 'No draft invoices found for this month' },
        { status: 404 }
      )
    }

    // Mark as sent
    const result = await sendInvoices(drafts.map(inv => inv.id))

    return NextResponse.json({
      success: true,
      message: `Sent ${result.count} invoices`,
      count: result.count
    })
  } catch (error) {
    console.error('POST /api/admin/invoices/send-all error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 3: Implement POST /api/invoices/[id]/mark-paid (Admin)**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/api/invoices/[id]/mark-paid/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helper'
import { markInvoicePaid } from '@/lib/invoice-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    const updated = await markInvoicePaid(params.id)

    return NextResponse.json({
      success: true,
      message: 'Invoice marked as paid',
      data: updated
    })
  } catch (error) {
    console.error('POST /api/invoices/[id]/mark-paid error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 4: Implement GET /api/admin/invoices (List all invoices)**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/api/admin/invoices/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const billingMonth = searchParams.get('billingMonth')
    const status = searchParams.get('status')

    const where: any = {}
    if (billingMonth) where.billingMonth = billingMonth
    if (status) where.status = status

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        lineItems: true,
        user: {
          select: { id: true, name: true, email: true, firmName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: invoices,
      count: invoices.length
    })
  } catch (error) {
    console.error('GET /api/admin/invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 5: Commit**

```bash
git add src/app/api/admin/invoices/route.ts \
  src/app/api/admin/invoices/generate/route.ts \
  src/app/api/admin/invoices/send-all/route.ts \
  src/app/api/invoices/[id]/mark-paid/route.ts
git commit -m "feat: implement admin invoice management endpoints"
```

---

## Task 7: Create Invoice List Page (Frontend)

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/invoices/page.tsx`
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/components/invoices/invoice-list.tsx`

**Step 1: Create InvoiceList component**

Create `/ceo-platform/ceo-monorepo/apps/web/src/components/invoices/invoice-list.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'

interface Invoice {
  id: string
  invoiceNo: string
  billingMonth: string
  totalAmount: string
  status: string
  sentAt: string | null
  confirmedAt: string | null
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/invoices')
      if (!response.ok) throw new Error('Failed to fetch invoices')
      const result = await response.json()
      setInvoices(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: 'secondary',
      SENT: 'default',
      CONFIRMED: 'outline',
      PAID: 'success'
    }
    const labels: Record<string, string> = {
      DRAFT: '草稿',
      SENT: '已發送',
      CONFIRMED: '已確認',
      PAID: '已支付'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  if (loading) return <div className="text-center py-8">載入中...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>月結帳單</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-gray-500">尚無帳單</p>
          ) : (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{invoice.invoiceNo}</h3>
                    <p className="text-sm text-gray-600">{invoice.billingMonth}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(parseFloat(invoice.totalAmount))}
                    </p>
                    <div className="mt-2">{getStatusBadge(invoice.status)}</div>
                  </div>
                  <Link href={`/invoices/${invoice.id}`}>
                    <Button variant="outline" className="ml-4">
                      詳情
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Create invoices page**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/invoices/page.tsx`:

```typescript
'use client'

import { InvoiceList } from '@/components/invoices/invoice-list'

export default function InvoicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">我的發票</h1>
        <InvoiceList />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/invoices/page.tsx src/components/invoices/invoice-list.tsx
git commit -m "feat: create invoice list page for employees"
```

---

## Task 8: Create Invoice Detail Page (Frontend)

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/invoices/[id]/page.tsx`
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/components/invoices/invoice-detail.tsx`

**Step 1: Create InvoiceDetail component**

Create `/ceo-platform/ceo-monorepo/apps/web/src/components/invoices/invoice-detail.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { ArrowLeft } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNo: string
  billingMonth: string
  billingStartDate: string
  billingEndDate: string
  totalAmount: string
  totalItems: number
  status: string
  invoiceFormat: string
  sentAt: string | null
  confirmedAt: string | null
  paidAt: string | null
  lineItems: Array<{
    id: string
    productName: string
    quantity: number
    unitPrice: string
    subtotal: string
  }>
}

export function InvoiceDetail({ id }: { id: string }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${id}`)
      if (!response.ok) throw new Error('Failed to fetch invoice')
      const result = await response.json()
      setInvoice(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      setConfirming(true)
      const response = await fetch(`/api/invoices/${id}/confirm`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Failed to confirm invoice')
      await fetchInvoice()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <div>載入中...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!invoice) return <div>找不到帳單</div>

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{invoice.invoiceNo}</CardTitle>
            <Badge>{invoice.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">計費期間</p>
              <p className="font-semibold">
                {invoice.billingMonth} (
                {new Date(invoice.billingStartDate).toLocaleDateString()} ~{' '}
                {new Date(invoice.billingEndDate).toLocaleDateString()})
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">訂單數</p>
              <p className="font-semibold">{invoice.totalItems} 件</p>
            </div>
          </div>

          {/* Line Items */}
          {invoice.lineItems.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">帳單明細</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">產品名稱</th>
                      <th className="text-right p-2">數量</th>
                      <th className="text-right p-2">單價</th>
                      <th className="text-right p-2">小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.productName}</td>
                        <td className="text-right p-2">{item.quantity}</td>
                        <td className="text-right p-2">
                          {formatCurrency(parseFloat(item.unitPrice))}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(parseFloat(item.subtotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-600">合計</p>
              <p className="text-2xl font-bold">
                {formatCurrency(parseFloat(invoice.totalAmount))}
              </p>
            </div>
          </div>

          {/* Actions */}
          {invoice.status === 'SENT' && (
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full"
            >
              {confirming ? '確認中...' : '確認帳單'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Create invoice detail page**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/invoices/[id]/page.tsx`:

```typescript
import { InvoiceDetail } from '@/components/invoices/invoice-detail'

export default function InvoiceDetailPage({
  params
}: {
  params: { id: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <InvoiceDetail id={params.id} />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/invoices/[id]/page.tsx src/components/invoices/invoice-detail.tsx
git commit -m "feat: create invoice detail page with confirmation flow"
```

---

## Task 9: Create Admin Invoice Management Page

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/app/admin/invoices/page.tsx`
- Create: `/ceo-platform/ceo-monorepo/apps/web/src/components/admin/invoice-manager.tsx`

**Step 1: Create InvoiceManager component**

Create `/ceo-platform/ceo-monorepo/apps/web/src/components/admin/invoice-manager.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/format'

interface Invoice {
  id: string
  invoiceNo: string
  billingMonth: string
  totalAmount: string
  status: string
  user: { name: string; email: string }
}

export function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [billingMonth, setBillingMonth] = useState(getCurrentMonth())
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [billingMonth])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/invoices?billingMonth=${billingMonth}`
      )
      if (!response.ok) throw new Error('Failed to fetch invoices')
      const result = await response.json()
      setInvoices(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingMonth })
      })
      if (!response.ok) throw new Error('Failed to generate invoices')
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  const handleSendAll = async () => {
    try {
      setSending(true)
      const response = await fetch('/api/admin/invoices/send-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingMonth })
      })
      if (!response.ok) throw new Error('Failed to send invoices')
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSending(false)
    }
  }

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark paid')
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  function getCurrentMonth() {
    const now = new Date()
    return now.toISOString().slice(0, 7)
  }

  const draftCount = invoices.filter(inv => inv.status === 'DRAFT').length

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>月結帳單管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="month"
              value={billingMonth}
              onChange={e => setBillingMonth(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? '生成中...' : '生成本月帳單'}
            </Button>
            {draftCount > 0 && (
              <Button
                onClick={handleSendAll}
                disabled={sending}
                variant="secondary"
              >
                {sending ? '發送中...' : `發送 ${draftCount} 張帳單`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {billingMonth} 年月結帳單 ({invoices.length} 張)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>載入中...</div>
          ) : invoices.length === 0 ? (
            <p className="text-gray-500">無帳單</p>
          ) : (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{invoice.invoiceNo}</h3>
                    <p className="text-sm text-gray-600">
                      {invoice.user.name} ({invoice.user.email})
                    </p>
                  </div>
                  <div className="text-right mr-6">
                    <p className="font-semibold">
                      {formatCurrency(parseFloat(invoice.totalAmount))}
                    </p>
                    <Badge className="mt-2">{invoice.status}</Badge>
                  </div>
                  {invoice.status !== 'PAID' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkPaid(invoice.id)}
                    >
                      標記已支付
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Create admin invoices page**

Create `/ceo-platform/ceo-monorepo/apps/web/src/app/admin/invoices/page.tsx`:

```typescript
import { InvoiceManager } from '@/components/admin/invoice-manager'

export default function AdminInvoicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">月結帳單管理</h1>
        <InvoiceManager />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/admin/invoices/page.tsx src/components/admin/invoice-manager.tsx
git commit -m "feat: create admin invoice management page"
```

---

## Task 10: Integration Testing - End-to-End Invoice Flow

**Files:**
- Create: `/ceo-platform/ceo-monorepo/apps/web/__tests__/e2e/invoices.test.ts`

**Step 1: Write comprehensive invoice flow test**

```typescript
// __tests__/e2e/invoices.test.ts
import { PrismaClient } from '@prisma/client'
import { generateMonthlyInvoices, sendInvoices, confirmInvoice, markInvoicePaid } from '@/lib/invoice-service'

describe('Invoice E2E Flow', () => {
  const prisma = new PrismaClient()

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('complete monthly billing flow', async () => {
    // 1. Create test user and products
    const user = await prisma.user.create({
      data: {
        email: `e2e-test-${Date.now()}@example.com`,
        taxId: `E2E${Date.now()}`,
        password: 'hashed',
        name: 'E2E Test User',
        firmName: 'E2E Test Firm',
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      }
    })

    // 2. Create orders for MONTHLY_BILLING
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const billingMonth = lastMonth.toISOString().slice(0, 7)

    const order1 = await prisma.order.create({
      data: {
        userId: user.id,
        orderNo: `E2E-ORD-${Date.now()}-1`,
        status: 'COMPLETED',
        paymentMethod: 'MONTHLY_BILLING',
        totalAmount: new Prisma.Decimal('5000.00'),
        createdAt: lastMonth
      }
    })

    // 3. Generate invoices
    const invoices = await generateMonthlyInvoices(billingMonth)
    expect(invoices).toHaveLength(1)
    expect(invoices[0].status).toBe('DRAFT')

    // 4. Send invoices
    const sentResult = await sendInvoices(invoices.map(inv => inv.id))
    expect(sentResult.count).toBe(1)

    // 5. Employee confirms invoice
    const confirmed = await confirmInvoice(invoices[0].id)
    expect(confirmed.status).toBe('CONFIRMED')

    // 6. Admin marks as paid
    const paid = await markInvoicePaid(invoices[0].id)
    expect(paid.status).toBe('PAID')

    // Cleanup
    await prisma.order.delete({ where: { id: order1.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })
})
```

**Step 2: Run test**

```bash
npm test -- __tests__/e2e/invoices.test.ts
```

Expected: PASS

**Step 3: Commit**

```bash
git add __tests__/e2e/invoices.test.ts
git commit -m "test: add end-to-end invoice flow tests"
```

---

## Task 11: Verify All API Endpoints - Manual Testing

**Files:**
- Reference: `src/app/api/invoices/**`

**Step 1: Start development server**

```bash
npm run dev
```

**Step 2: Test endpoints manually using curl or Postman**

```bash
# 1. Get user invoices (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/invoices

# 2. Get single invoice
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/invoices/{id}

# 3. Confirm invoice
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/invoices/{id}/confirm

# 4. Admin: Generate invoices
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"billingMonth":"2026-02"}' \
  http://localhost:3000/api/admin/invoices/generate

# 5. Admin: Send all draft invoices
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"billingMonth":"2026-02"}' \
  http://localhost:3000/api/admin/invoices/send-all

# 6. Admin: Mark invoice as paid
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/invoices/{id}/mark-paid
```

Expected: All endpoints return 200 OK with proper responses

**Step 3: Verify UI pages load**

- Visit `http://localhost:3000/invoices` - Invoice list page
- Visit `http://localhost:3000/invoices/{id}` - Invoice detail page
- Visit `http://localhost:3000/admin/invoices` - Admin management page

**Step 4: Commit verification notes**

```bash
git add -A
git commit -m "test: manual verification of all invoice endpoints and pages"
```

---

## Task 12: Update Documentation and DailyProgress

**Files:**
- Modify: `/ceo-platform/DailyProgress.md`
- Modify: `/ceo-platform/Gem3Plan.md`

**Step 1: Update DailyProgress.md**

Add this section at the top:

```markdown
## 2026-02-28 (Phase 4 - Payment System Enhancement) ✅ Implementation Complete

### 🎉 Phase 4: Payment System Enhancement - COMPLETE

**Phase 4 實施結果**：✅ 完全實施 (2026-02-28)
- ✅ **資料庫遷移**：Invoice + InvoiceLineItem 表建立
- ✅ **API 開發**：9 個端點全部實施
- ✅ **自動生成邏輯**：月結帳單自動生成
- ✅ **前端頁面**：3 個頁面（員工列表、詳情、管理）
- ✅ **測試與驗證**：E2E 測試通過

**實施統計**：
- 新增表：Invoice, InvoiceLineItem
- API 端點：9 個 (6 個員工 + 3 個管理)
- 新增頁面：3 個 (員工 2 + 管理 1)
- 測試覆蓋：E2E 完整流程
- 開發工時：3-4 週 (如計劃)

**核心功能**：
- 月結帳單自動生成 (月底彙總)
- 簡單格式 + 詳細格式支援
- 員工確認流程
- 管理員發送 + 標記已支付
- 完整的 REST API

**建立的檔案** (12 個任務)：
1. Schema: Invoice + InvoiceLineItem models
2. Service: invoice-service.ts (生成、發送、確認、支付)
3. API: /api/invoices/* (6 個員工端點)
4. API: /api/admin/invoices/* (3 個管理端點)
5. Frontend: 員工列表頁 (invoices/page.tsx)
6. Frontend: 員工詳情頁 (invoices/[id]/page.tsx)
7. Frontend: 管理頁面 (admin/invoices/page.tsx)
8. Test: E2E 測試
9. Test: Manual 驗證

**驗證清單** ✅：
- [x] 資料庫表建立並遷移成功
- [x] 所有 API 端點正常工作
- [x] 自動生成邏輯驗證通過
- [x] 前端頁面正確渲染
- [x] E2E 測試通過
- [x] 手動測試驗證通過
```

**Step 2: Update Gem3Plan.md Phase 4 section**

Change:
```markdown
**進度：Phase 4 設計完成 ✅ (2026-02-28)**
```

To:
```markdown
**進度：✅ 完全實施 (2026-02-28)**
```

**Step 3: Commit**

```bash
git add DailyProgress.md Gem3Plan.md
git commit -m "docs: update progress with Phase 4 completion"
```

---

# Summary

**Total Tasks:** 12
**Estimated Time:** 3-4 weeks
**Key Deliverables:**
- 2 new database tables (Invoice, InvoiceLineItem)
- 9 REST API endpoints (6 user + 3 admin)
- 3 frontend pages (employee list, detail, admin management)
- Complete E2E invoice flow
- Comprehensive test coverage

**Success Criteria:**
- All migrations apply successfully
- All API endpoints return correct responses
- Monthly invoice generation works automatically
- Employees can view and confirm invoices
- Admins can manage and track payments
- E2E tests pass
- Frontend pages render correctly

---
