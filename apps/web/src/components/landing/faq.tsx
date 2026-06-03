import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is Auriga a bank?',
    answer:
      'Auriga partners with Swan, an Electronic Money Institution licensed and supervised by the ACPR in France. Your funds are safeguarded in dedicated accounts at leading European credit institutions, in full compliance with EU e-money regulations.',
  },
  {
    question: 'How is my money protected?',
    answer:
      'Your funds are safeguarded in ring-fenced accounts at top-tier credit institutions, completely separate from operational funds. This means your money is protected even in the unlikely event of insolvency.',
  },
  {
    question: 'Which countries are supported?',
    answer:
      'Auriga is available across 30+ countries in the European Economic Area. You can open an account from anywhere in the EEA \u2014 no local address or residency required.',
  },
  {
    question: 'What does it cost?',
    answer:
      'Free to open. No monthly fees. Your virtual Mastercard is free. Transfers within SEPA are free or near-free. We believe in transparent, simple pricing with zero hidden markups.',
  },
  {
    question: 'How fast are transfers?',
    answer:
      'SEPA Instant transfers arrive in under 10 seconds, 24 hours a day, 7 days a week \u2014 including holidays. Standard SEPA transfers settle within one business day.',
  },
  {
    question: 'Can I use the card worldwide?',
    answer:
      'Yes. Your Mastercard works everywhere Mastercard is accepted \u2014 online and in-store, in every country. Add it to Apple Pay or Google Pay instantly.',
  },
  {
    question: 'How is Auriga different from Wise or Revolut?',
    answer:
      'Auriga gives you a full, dedicated EUR IBAN in your name \u2014 not a pooled sub-account. Combined with SEPA Instant, a Mastercard, and zero FX markup, Auriga is built to be your primary account, not a side tool.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="mb-14 sm:mb-16 max-w-3xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            Questions? Straight answers.
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed">
            Everything you need to know before you open your account.
          </p>
        </Reveal>

        <Accordion type="single" collapsible className="max-w-3xl">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="py-7 text-lg sm:text-xl font-heading">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
