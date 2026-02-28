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
