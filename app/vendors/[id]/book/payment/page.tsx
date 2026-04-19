import { Suspense } from 'react'
import PaymentClient from './PaymentClient'

// searchParams is a Promise in Next.js 16 — must be awaited in a Server Component
export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ bookingId?: string; amount?: string; vendorName?: string }>
}) {
  const { id } = await params
  const { bookingId, amount, vendorName } = await searchParams

  return (
    <Suspense>
      <PaymentClient
        vendorId={id}
        bookingId={bookingId ?? ''}
        amount={amount ?? '0'}
        vendorName={vendorName ?? 'Vendor'}
      />
    </Suspense>
  )
}
