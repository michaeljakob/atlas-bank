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
  return (
    <section id="faq" className="py-24 sm:py-36 bg-auriga-bg-subtle border-y border-auriga-border">
      <Container>
        <Reveal as="div" className="mb-14 sm:mb-16 max-w-3xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            Questions? Straight answers.
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed">
            Everything you need to know before you open your business account.
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
