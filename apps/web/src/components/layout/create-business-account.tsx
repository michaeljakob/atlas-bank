'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const INPUT_CLS =
  'w-full rounded-xl border border-auriga-border/70 bg-white px-3.5 py-2.5 text-[13px] text-auriga-text-primary placeholder:text-auriga-text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-auriga-accent/20 focus:border-auriga-accent hover:border-auriga-accent/40';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type Step = 'type' | 'details' | 'address' | 'review' | 'success';

const STEPS: Step[] = ['type', 'details', 'address', 'review'];

const COMPANY_TYPES = [
  { id: 'sole_proprietor', label: 'Sole proprietorship', description: 'Self-employed individual or freelancer' },
  { id: 'gmbh', label: 'GmbH / LLC', description: 'Limited liability company' },
  { id: 'ug', label: 'UG (haftungsbeschränkt)', description: 'Mini-GmbH / limited liability startup' },
  { id: 'ag', label: 'AG / Corporation', description: 'Public or private stock corporation' },
  { id: 'gbr', label: 'GbR / Partnership', description: 'Civil law partnership' },
  { id: 'other', label: 'Other', description: 'Non-profit, cooperative, or other entity' },
] as const;

const INDUSTRIES = [
  'Technology & Software',
  'E-commerce & Retail',
  'Financial Services',
  'Consulting & Professional Services',
  'Healthcare & Biotech',
  'Real Estate',
  'Manufacturing',
  'Marketing & Media',
  'Education',
  'Food & Hospitality',
  'Transportation & Logistics',
  'Other',
];

const COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'AT', name: 'Austria' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'FI', name: 'Finland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'PL', name: 'Poland' },
  { code: 'CH', name: 'Switzerland' },
];

interface FormData {
  companyType: string;
  companyName: string;
  registrationNumber: string;
  industry: string;
  website: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

const EMPTY_FORM: FormData = {
  companyType: '',
  companyName: '',
  registrationNumber: '',
  industry: '',
  website: '',
  line1: '',
  line2: '',
  city: '',
  postalCode: '',
  country: 'DE',
};

export function CreateBusinessAccount({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (account: { id: string; companyName: string; iban: string }) => void;
}) {
  const [step, setStep] = React.useState<Step>('type');
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ iban: string; bic: string; companyName: string } | null>(null);

  function reset() {
    setStep('type');
    setForm(EMPTY_FORM);
    setResult(null);
    setSubmitting(false);
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  const patch = (partial: Partial<FormData>) => setForm((prev) => ({ ...prev, ...partial }));

  const stepIdx = STEPS.indexOf(step as any);
  const progress = step === 'success' ? 100 : ((stepIdx + 1) / STEPS.length) * 100;

  function canAdvance(): boolean {
    switch (step) {
      case 'type':
        return !!form.companyType;
      case 'details':
        return !!form.companyName.trim() && !!form.registrationNumber.trim() && !!form.industry;
      case 'address':
        return !!form.line1.trim() && !!form.city.trim() && !!form.postalCode.trim() && !!form.country;
      default:
        return true;
    }
  }

  function next() {
    const idx = STEPS.indexOf(step as any);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function back() {
    const idx = STEPS.indexOf(step as any);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await api.createBusinessAccount({
        companyType: form.companyType,
        companyName: form.companyName.trim(),
        registrationNumber: form.registrationNumber.trim(),
        industry: form.industry,
        website: form.website.trim() || undefined,
        address: {
          line1: form.line1.trim(),
          line2: form.line2.trim() || undefined,
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country,
        },
      });
      setResult({ iban: res.iban, bic: res.bic, companyName: res.companyName });
      setStep('success');
      toast.success('Business account created');
      onCreated?.({ id: res.id, companyName: res.companyName, iban: res.iban });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" showClose={step !== 'success'}>
        {/* Progress bar */}
        <div className="h-1 bg-auriga-bg-subtle">
          <div
            className="h-full bg-auriga-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8">
          {step === 'type' && <StepType value={form.companyType} onChange={(v) => patch({ companyType: v })} />}
          {step === 'details' && <StepDetails form={form} patch={patch} />}
          {step === 'address' && <StepAddress form={form} patch={patch} />}
          {step === 'review' && <StepReview form={form} />}
          {step === 'success' && result && <StepSuccess result={result} onClose={() => handleClose(false)} />}

          {step !== 'success' && (
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-auriga-border/50">
              <div className="text-[11px] text-auriga-text-secondary tabular-nums">
                Step {stepIdx + 1} of {STEPS.length}
              </div>
              <div className="flex gap-2.5">
                {stepIdx > 0 && (
                  <Button variant="ghost" size="sm" onClick={back}>
                    Back
                  </Button>
                )}
                {step === 'review' ? (
                  <Button size="sm" onClick={submit} loading={submitting} disabled={!canAdvance()}>
                    Create account
                  </Button>
                ) : (
                  <Button size="sm" onClick={next} disabled={!canAdvance()}>
                    Continue
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepType({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>What type of business?</DialogTitle>
        <DialogDescription>
          Choose your company&apos;s legal structure. This determines the verification requirements.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        {COMPANY_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              'flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all duration-150',
              value === t.id
                ? 'border-auriga-accent bg-auriga-accent/5 ring-1 ring-auriga-accent/30'
                : 'border-auriga-border/70 hover:border-auriga-accent/40 hover:bg-auriga-bg-subtle/50',
            )}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                value === t.id ? 'border-auriga-accent' : 'border-auriga-border',
              )}
            >
              {value === t.id && <div className="w-2 h-2 rounded-full bg-auriga-accent" />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-auriga-text-primary">{t.label}</p>
              <p className="text-[11px] text-auriga-text-secondary">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function StepDetails({ form, patch }: { form: FormData; patch: (p: Partial<FormData>) => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Business details</DialogTitle>
        <DialogDescription>
          Enter your company information as registered with the commercial register.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Field label="Company name" required>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => patch({ companyName: e.target.value })}
            placeholder="Acme GmbH"
            className={INPUT_CLS}
            autoFocus
          />
        </Field>

        <Field label="Registration number" required hint="e.g. HRB 12345 B">
          <input
            type="text"
            value={form.registrationNumber}
            onChange={(e) => patch({ registrationNumber: e.target.value })}
            placeholder="HRB 12345 B"
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Industry" required>
          <select
            value={form.industry}
            onChange={(e) => patch({ industry: e.target.value })}
            className={cn(INPUT_CLS, 'appearance-none cursor-pointer', !form.industry && 'text-auriga-text-secondary')}
          >
            <option value="" disabled>
              Select industry
            </option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Website" hint="Optional">
          <input
            type="url"
            value={form.website}
            onChange={(e) => patch({ website: e.target.value })}
            placeholder="https://acme.com"
            className={INPUT_CLS}
          />
        </Field>
      </div>
    </>
  );
}

function StepAddress({ form, patch }: { form: FormData; patch: (p: Partial<FormData>) => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Business address</DialogTitle>
        <DialogDescription>
          The registered address of your company.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Field label="Street address" required>
          <input
            type="text"
            value={form.line1}
            onChange={(e) => patch({ line1: e.target.value })}
            placeholder="Friedrichstraße 123"
            className={INPUT_CLS}
            autoFocus
          />
        </Field>

        <Field label="Floor / Suite" hint="Optional">
          <input
            type="text"
            value={form.line2}
            onChange={(e) => patch({ line2: e.target.value })}
            placeholder="3rd floor"
            className={INPUT_CLS}
          />
        </Field>

        <div className="grid grid-cols-[1fr_1.5fr] gap-3">
          <Field label="Postal code" required>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => patch({ postalCode: e.target.value })}
              placeholder="10117"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="City" required>
            <input
              type="text"
              value={form.city}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder="Berlin"
              className={INPUT_CLS}
            />
          </Field>
        </div>

        <Field label="Country" required>
          <select
            value={form.country}
            onChange={(e) => patch({ country: e.target.value })}
            className={cn(INPUT_CLS, 'appearance-none cursor-pointer')}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </>
  );
}

function StepReview({ form }: { form: FormData }) {
  const companyType = COMPANY_TYPES.find((t) => t.id === form.companyType);
  const country = COUNTRIES.find((c) => c.code === form.country);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Review & confirm</DialogTitle>
        <DialogDescription>
          Please verify everything is correct before we create your business account.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <ReviewSection title="Company type">
          <ReviewRow label="Type" value={companyType?.label ?? form.companyType} />
        </ReviewSection>

        <ReviewSection title="Business details">
          <ReviewRow label="Company" value={form.companyName} />
          <ReviewRow label="Reg. number" value={form.registrationNumber} />
          <ReviewRow label="Industry" value={form.industry} />
          {form.website && <ReviewRow label="Website" value={form.website} />}
        </ReviewSection>

        <ReviewSection title="Address">
          <ReviewRow label="Street" value={form.line1} />
          {form.line2 && <ReviewRow label="Floor / Suite" value={form.line2} />}
          <ReviewRow label="City" value={`${form.postalCode} ${form.city}`} />
          <ReviewRow label="Country" value={country?.name ?? form.country} />
        </ReviewSection>
      </div>

      <p className="text-[11px] text-auriga-text-secondary mt-5 leading-relaxed">
        By creating this account you agree to the{' '}
        <a href="/terms" className="underline underline-offset-2 hover:text-auriga-text-primary transition-colors">
          Business Terms of Service
        </a>{' '}
        and confirm that the information provided is accurate.
      </p>
    </>
  );
}

function StepSuccess({
  result,
  onClose,
}: {
  result: { iban: string; bic: string; companyName: string };
  onClose: () => void;
}) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold tracking-tight mb-1">Account created</h2>
      <p className="text-[13px] text-auriga-text-secondary mb-6">
        Your business account for <span className="font-medium text-auriga-text-primary">{result.companyName}</span> is ready.
      </p>

      <div className="bg-auriga-bg-subtle rounded-xl p-4 text-left space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="text-[12px] text-auriga-text-secondary">IBAN</span>
          <span className="text-[12px] font-medium font-mono tracking-wide">{result.iban}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[12px] text-auriga-text-secondary">BIC</span>
          <span className="text-[12px] font-medium font-mono">{result.bic}</span>
        </div>
      </div>

      <Button className="w-full" onClick={onClose}>
        Go to business account
      </Button>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-auriga-text-primary mb-1.5 flex items-baseline gap-1">
        {label}
        {required && <span className="text-auriga-accent-700">*</span>}
        {hint && <span className="text-auriga-text-secondary font-normal ml-auto">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-auriga-border/70 overflow-hidden">
      <div className="px-4 py-2 bg-auriga-bg-subtle border-b border-auriga-border/50">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-auriga-text-secondary">{title}</p>
      </div>
      <div className="divide-y divide-auriga-border/50 px-4">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[12px] text-auriga-text-secondary">{label}</span>
      <span className="text-[12px] font-medium text-auriga-text-primary">{value}</span>
    </div>
  );
}
