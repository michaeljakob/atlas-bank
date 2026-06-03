'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { clsx } from 'clsx';

const faqItems = [
  { q: 'How do I fund my account?', a: 'Share your IBAN or transfer via SEPA.' },
  { q: 'How long do transfers take?', a: 'Instant: seconds. Standard: 1 business day.' },
  { q: 'Can I use my card abroad?', a: 'Yes, worldwide Mastercard. Non-EUR converted at Mastercard rate.' },
  { q: 'How do I get a physical card?', a: 'Card → Order physical card. 5-7 business days.' },
  { q: 'Is my money protected?', a: 'Your funds are safeguarded in dedicated accounts at regulated European credit institutions, separate from Auriga and Swan operational funds, in line with EU e-money regulations. As e-money, funds are not covered by a deposit guarantee scheme.' },
  { q: 'How do I close my account?', a: 'Settings → Close account. Transfer out balance first.' },
];

const contactOptions = [
  {
    title: 'Live chat',
    description: 'Talk to our team',
    availability: 'Available 24/7',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    color: 'bg-auriga-accent/10 text-auriga-text-primary',
  },
  {
    title: 'Email',
    description: 'Get help via email',
    availability: 'support@aurigamoney.com',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    color: 'bg-auriga-accent/15 text-auriga-text-primary',
  },
  {
    title: 'Help center',
    description: 'Browse guides',
    availability: 'Read articles',
    href: '/help',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    color: 'bg-auriga-green-50 text-auriga-green-700',
  },
];

const topics = ['General', 'Account', 'Card', 'Transfer', 'Fraud'];

export default function SupportPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setMessage('');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Support</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {contactOptions.map((option) => {
          const inner = (
            <>
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3', option.color)}>
                {option.icon}
              </div>
              <h3 className="text-sm font-medium">{option.title}</h3>
              <p className="text-xs text-auriga-text-secondary mt-0.5">{option.description}</p>
              <p className="text-[11px] text-auriga-text-secondary/70 mt-1">{option.availability}</p>
            </>
          );
          const className =
            'block bg-white rounded-2xl border border-auriga-border/70 p-5 text-left hover:shadow-sm transition-shadow';
          if ('href' in option && option.href) {
            return (
              <Link key={option.title} href={option.href as Route} className={className}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={option.title} className={className}>
              {inner}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <p className="text-[13px] uppercase tracking-wider text-auriga-text-secondary mb-4">Common questions</p>
          <Accordion type="single" collapsible>
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="py-4 text-sm">{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-auriga-border/70 p-6 lg:sticky lg:top-6">
            <h3 className="text-sm font-semibold">Message us</h3>
            <p className="text-xs text-auriga-text-secondary mt-0.5 mb-5">We respond within a few hours</p>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-auriga-accent-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-auriga-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Sent!</p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <select className="w-full rounded-xl border border-auriga-border/70 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-auriga-accent/20">
                    {topics.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-auriga-border/70 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-auriga-accent/20 resize-none placeholder:text-auriga-text-secondary/40"
                  placeholder="How can we help?"
                  required
                />
                <Button type="submit" size="sm" className="w-full">Send</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
