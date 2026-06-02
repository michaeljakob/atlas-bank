'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import { formatMoney } from '@atlas-bank/shared';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PaymentRequest {
  id: string;
  amountCents: number;
  currency: string;
  note?: string;
  status: string;
  requesterName: string;
  requesterHandle?: string | null;
  expiresAt?: string;
}

export default function PayPage() {
  const params = useParams();
  const token = params.token as string;
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPaymentRequestByToken(token)
      .then(setRequest)
      .catch(() => setError('Payment request not found or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-atlas-bg-subtle flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-atlas-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-atlas-bg-subtle flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-atlas-border/70 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-atlas-error/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-atlas-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">Not found</h1>
          <p className="text-sm text-atlas-text-secondary mb-6">{error || 'This payment request could not be found.'}</p>
          <Link href="/">
            <Button variant="secondary">Go to Atlas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = request.expiresAt && new Date(request.expiresAt) < new Date();
  const isPaid = request.status === 'paid';

  return (
    <div className="min-h-screen bg-atlas-bg-subtle flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-atlas-border/70 overflow-hidden max-w-md w-full">
        <div className="p-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <img src="/atlas-lockup.svg" alt="Atlas" className="h-8 w-auto" />
          </div>

          {isPaid ? (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-atlas-accent-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-atlas-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold mb-2">Already paid</h1>
              <p className="text-sm text-atlas-text-secondary">This payment request has been fulfilled.</p>
            </>
          ) : isExpired ? (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-atlas-heather-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold mb-2">Expired</h1>
              <p className="text-sm text-atlas-text-secondary">This payment request has expired.</p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <MerchantLogo name={request.requesterName} size={56} />
              </div>
              <p className="text-sm text-atlas-text-secondary mb-1">{request.requesterName} is requesting</p>
              {request.requesterHandle && (
                <p className="text-sm font-medium text-atlas-text-primary mb-2">@{request.requesterHandle}</p>
              )}
              <p className="text-4xl font-semibold tracking-tight mb-2">
                {formatMoney(request.amountCents, request.currency)}
              </p>
              {request.note && (
                <p className="text-sm text-atlas-text-secondary mt-1 mb-6">&ldquo;{request.note}&rdquo;</p>
              )}

              <div className="space-y-3 mt-8">
                <Link href={`/login?redirect=/pay/${token}`} className="block">
                  <Button className="w-full" size="lg">Pay with Atlas</Button>
                </Link>
                <p className="text-xs text-atlas-text-secondary">
                  Don&apos;t have an account?{' '}
                  <Link href="/onboarding" className="text-atlas-text-primary font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-atlas-border/50 px-8 py-4">
          <p className="text-[11px] text-atlas-text-secondary/60 text-center leading-relaxed">
            Atlas is not a bank. Banking services provided by Swan SAS, authorised by the ACPR.
          </p>
        </div>
      </div>
    </div>
  );
}
