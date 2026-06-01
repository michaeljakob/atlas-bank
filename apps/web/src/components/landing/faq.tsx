'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/container';

const faqs = [
  {
    question: 'Is Atlas a bank?',
    answer:
      'No. Atlas is not a bank. Banking and payment services (account, IBAN, card) are provided by Swan SAS, an Electronic Money Institution authorised and supervised by the ACPR in France. Your funds are safeguarded in accordance with EU e-money regulations.',
  },
  {
    question: 'How are my funds protected?',
    answer:
      "Your funds are safeguarded by Swan in dedicated accounts at credit institutions, separate from Swan\u2019s operational funds. This is required by EU e-money regulation. Note: this is not the same as bank deposit insurance (FGDR).",
  },
  {
    question: 'Which countries are supported?',
    answer:
      "Atlas is currently available to residents of the European Economic Area (EEA). Specific country availability may be subject to eligibility checks. We\u2019ll expand to additional jurisdictions over time.",
  },
  {
    question: 'What does it cost?',
    answer:
      'Account opening and your virtual card are free. We charge a small monthly fee for active accounts and for optional services like physical cards. Full pricing will be published before launch.',
  },
  {
    question: 'How fast can I receive money?',
    answer:
      'Your IBAN supports SEPA Credit Transfer (1 business day) and SEPA Instant (seconds, 24/7). Most incoming transfers from EU banks arrive within seconds if sent as SEPA Instant.',
  },
  {
    question: 'Can I use the card internationally?',
    answer:
      'Yes. Your Mastercard works anywhere Mastercard is accepted — online and in-store, worldwide. You can add it to Apple Pay or Google Pay for contactless payments.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32 bg-atlas-bg-subtle">
      <Container>
        <div className="text-center mb-16">
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
