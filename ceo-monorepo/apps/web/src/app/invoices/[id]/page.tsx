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
