'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/container';

const faqs = [
  {
    question: 'What documents do I need to register?',
    answer: "You'll need proof of identity (passport or national ID), proof of address, and your business registration document (if applicable). Freelancers and sole traders can register with personal documents.",
  },
  {
    question: 'How do you keep funds secure?',
    answer: "Business funds are safeguarded in dedicated accounts at regulated credit institutions, separate from operational funds. This is required by EU e-money regulations under Swan's EMI licence.",
  },
  {
    question: 'How much does it cost to open an account?',
    answer: "Account opening is free. There are no monthly maintenance fees. You only pay per-transaction fees: \u20AC0.50 for SEPA transfers. Physical cards are \u20AC9.99 each.",
  },
  {
    question: 'Can I access my money any time?',
    answer: "Yes. Your funds are always available. You can send SEPA transfers 24/7 (instant or standard), spend with your card worldwide, and withdraw cash at any ATM.",
  },
  {
    question: 'How long does it take to get set up?',
    answer: "Most businesses are verified and operational within minutes. Complex structures may take up to 24 hours for compliance review.",
  },
];

export function BusinessFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 sm:py-32 bg-atlas-bg-subtle">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl border border-atlas-border overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-atlas-text-primary pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 shrink-0 text-atlas-text-secondary transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-sm text-atlas-text-secondary leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
