'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/container';
import { EmailStep } from '@/components/onboarding/email-step';
import { VerifyStep } from '@/components/onboarding/verify-step';
import { DetailsStep } from '@/components/onboarding/details-step';
import { KycStep } from '@/components/onboarding/kyc-step';
import { SuccessStep } from '@/components/onboarding/success-step';

type OnboardingStep = 'email' | 'verify' | 'details' | 'kyc' | 'success';

interface OnboardingState {
  email: string;
  token: string;
  kycUrl: string;
  account: { iban: string; bic: string; holderName: string } | null;
  card: { last4: string; type: string } | null;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('email');
  const [state, setState] = useState<OnboardingState>({
    email: '',
    token: '',
    kycUrl: '',
    account: null,
    card: null,
  });

  const steps: OnboardingStep[] = ['email', 'verify', 'details', 'kyc', 'success'];
  const stepLabels: Record<OnboardingStep, string> = {
    email: 'Your email',
    verify: 'Verify it\u2019s you',
    details: 'A few details',
    kyc: 'Quick ID check',
    success: 'All done',
  };
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-atlas-bg-subtle">
      <div className="fixed top-0 left-0 right-0 h-1 bg-atlas-border z-50">
        <div
          className="h-full bg-atlas-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Container className="py-12 sm:py-20 max-w-lg">
        <div className="flex items-center justify-center mb-6">
          <img src="/atlas-lockup.svg" alt="Atlas" className="h-9 w-auto" />
        </div>

        {step !== 'success' && (
          <p className="text-center text-xs font-medium uppercase tracking-wide text-atlas-text-secondary mb-8">
            Step {currentIndex + 1} of {steps.length - 1} · {stepLabels[step]}
          </p>
        )}

        {step === 'email' && (
          <EmailStep
            onComplete={(email) => {
              setState((s) => ({ ...s, email }));
              setStep('verify');
            }}
          />
        )}

        {step === 'verify' && (
          <VerifyStep
            email={state.email}
            onComplete={(token) => {
              setState((s) => ({ ...s, token }));
              setStep('details');
            }}
            onBack={() => setStep('email')}
          />
        )}

        {step === 'details' && (
          <DetailsStep
            onComplete={(kycUrl) => {
              setState((s) => ({ ...s, kycUrl }));
              setStep('kyc');
            }}
          />
        )}

        {step === 'kyc' && (
          <KycStep
            kycUrl={state.kycUrl}
            onComplete={(account, card) => {
              setState((s) => ({ ...s, account, card }));
              setStep('success');
            }}
          />
        )}

        {step === 'success' && state.account && state.card && (
          <SuccessStep account={state.account} card={state.card} />
        )}
      </Container>
    </div>
  );
}
