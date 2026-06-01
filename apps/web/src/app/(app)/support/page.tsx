'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqItems = [
  { q: 'How do I fund my account?', a: 'Share your IBAN with your employer or clients, or transfer from another bank account via SEPA transfer.' },
  { q: 'How long do transfers take?', a: 'SEPA Instant: seconds. Standard SEPA: up to 1 business day.' },
  { q: 'Can I use my card abroad?', a: 'Yes, your Mastercard works worldwide. The account is EUR-only, so non-EUR transactions will be converted at the Mastercard rate.' },
  { q: 'How do I get a physical card?', a: 'Go to Card → Order physical card. It usually arrives within 5-7 business days.' },
];

export default function SupportPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setMessage('');
  }

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <h1 className="text-2xl font-medium mb-8">Help & support</h1>

      {/* FAQ */}
      <section className="bg-white rounded-2xl border border-atlas-border p-6 mb-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Frequently asked</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-atlas-border last:border-0 pb-4 last:pb-0">
              <p className="text-sm font-medium mb-1">{item.q}</p>
              <p className="text-xs text-atlas-text-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-2xl border border-atlas-border p-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Contact us</h2>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-sm text-atlas-success">Message sent. We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-atlas-text-secondary">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-atlas-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-atlas-accent resize-none"
                placeholder="Describe your issue..."
                required
              />
            </div>
            <Button type="submit" size="sm">Send message</Button>
          </form>
        )}
      </section>
    </div>
  );
}
