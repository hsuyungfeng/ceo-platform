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
