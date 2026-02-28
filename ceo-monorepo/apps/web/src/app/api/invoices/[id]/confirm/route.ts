import { NextRequest, NextResponse } from 'next/server'
import { getAuthData } from '@/lib/auth-helper'
import { confirmInvoice } from '@/lib/invoice-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user using unified auth helper (supports Bearer Token and Session Cookies)
    const authData = await getAuthData(request)

    if (!authData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
