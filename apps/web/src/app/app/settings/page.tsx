'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag } from '@/components/ui/flag';
import { HandleSettings } from '@/components/handle/handle-settings';
import { REGULATORY_DISCLOSURE } from '@atlas-bank/shared';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

type SettingsTab = 'personal' | 'preferences' | 'security' | 'notifications' | 'documents' | 'support' | 'legal';

const tabs: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal info', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { id: 'preferences', label: 'Preferences', icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75' },
  { id: 'security', label: 'Security', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { id: 'notifications', label: 'Notifications', icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' },
  { id: 'documents', label: 'Documents', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
  { id: 'support', label: 'Support', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z' },
  { id: 'legal', label: 'Legal', icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="lg:w-48 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-atlas-bg-subtle text-atlas-text-primary'
                    : 'text-atlas-text-secondary hover:text-atlas-text-primary'
                )}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === 'personal' && <PersonalSection />}
          {activeTab === 'preferences' && <PreferencesSection />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'notifications' && <NotificationsSection />}
          {activeTab === 'documents' && <DocumentsSection />}
          {activeTab === 'support' && <SupportSection />}
          {activeTab === 'legal' && <LegalSection />}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-semibold uppercase tracking-wider text-atlas-text-secondary mb-4">
      {children}
    </h3>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-atlas-border/70 p-5', className)}>
      {children}
    </div>
  );
}

function PersonalSection() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await api.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlas-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Your data export has been downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  async function handleCloseAccount() {
    if (!window.confirm('This permanently closes your account, deactivates your IBAN and card, and erases your data. This cannot be undone. Continue?')) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteMyAccount();
      await api.logout();
      toast.success('Your account has been closed');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not close account');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-atlas-border/50">
          <div className="w-14 h-14 rounded-full bg-atlas-accent flex items-center justify-center">
            <span className="text-base font-bold text-atlas-black">AJ</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold">Alex Johnson</h2>
            <p className="text-[13px] text-atlas-text-secondary">Personal account</p>
          </div>
          <Badge variant="success">Verified</Badge>
        </div>

        <SectionHeader>Basic information</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <DetailRow label="Full name" value="Alex Johnson" />
          <DetailRow label="Email" value="alex@example.com" />
          <DetailRow label="Phone" value="+49 170 •••• 4589" />
          <DetailRow label="Date of birth" value="March 15, 1992" />
          <DetailRow label="Nationality" value="German" />
          <DetailRow label="Gender" value="Male" />
        </div>
      </Card>

      <Card>
        <SectionHeader>Payment handle</SectionHeader>
        <p className="text-[13px] text-atlas-text-secondary mb-4">
          Your @handle lets others send and request money without sharing your IBAN.
        </p>
        <HandleSettings />
      </Card>

      <Card>
        <SectionHeader>Residential address</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <DetailRow label="Street" value="Friedrichstraße 123" />
          <DetailRow label="Apartment / Floor" value="4. OG, Apt 12" />
          <DetailRow label="Postal code" value="10117" />
          <DetailRow label="City" value="Berlin" />
          <DetailRow label="State" value="Berlin" />
          <DetailRow label="Country" value={<><Flag code="DE" name="Germany" className="w-4 h-4" />Germany</>} />
        </div>
        <p className="text-xs text-atlas-text-secondary mt-4">
          To update your address, please contact support with proof of residency.
        </p>
      </Card>

      <Card>
        <SectionHeader>Tax & employment</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <DetailRow label="Tax residency" value="Germany" />
          <DetailRow label="Tax ID (TIN)" value="•••••••••• 47" />
          <DetailRow label="Employment status" value="Employed" />
          <DetailRow label="Occupation" value="Software Engineer" />
          <DetailRow label="Employer" value="TechCorp GmbH" />
        </div>
      </Card>

      <Card>
        <SectionHeader>Account details</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <DetailRow label="Account ID" value="ATL-8291-4523" />
          <DetailRow label="IBAN" value="DE89 •••• •••• •••• •••• 42" />
          <DetailRow label="BIC / SWIFT" value="ATLSDEFFXXX" />
          <DetailRow label="Account opened" value="January 8, 2024" />
          <DetailRow label="KYC status" value="✓ Fully verified" />
        </div>
      </Card>

      <Card>
        <SectionHeader>Your data</SectionHeader>
        <p className="text-[13px] text-atlas-text-secondary leading-relaxed mb-4">
          Download a machine-readable copy of your personal data, accounts and transactions (GDPR Art. 20).
        </p>
        <Button variant="outline" size="sm" onClick={handleExport} loading={exporting}>
          Download my data
        </Button>
      </Card>

      <details className="group">
        <summary className="text-[13px] text-atlas-text-secondary cursor-pointer hover:text-atlas-text-primary transition-colors list-none flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          Close my account
        </summary>
        <div className="mt-4 bg-white rounded-2xl border border-atlas-error/20 p-5">
          <p className="text-[13px] text-atlas-text-secondary leading-relaxed mb-4">
            Closing your account will permanently deactivate your IBAN and card and erase your data (GDPR Art. 17). Any remaining balance must be transferred out first.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-atlas-error hover:bg-atlas-error/10"
            onClick={handleCloseAccount}
            loading={deleting}
          >
            Close my account
          </Button>
        </div>
      </details>
    </div>
  );
}

function PreferencesSection() {
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Europe/Berlin');
  const [dateFormat, setDateFormat] = useState('dd.MM.yyyy');
  const [statementFormat, setStatementFormat] = useState('pdf');
  const [roundUpSavings, setRoundUpSavings] = useState(true);
  const [instantNotifications, setInstantNotifications] = useState(true);

  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader>Display & currency</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <SelectRow
            label="Main display currency"
            description="All balances and totals shown in this currency"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: 'EUR', label: '€ EUR — Euro' },
              { value: 'USD', label: '$ USD — US Dollar' },
              { value: 'GBP', label: '£ GBP — British Pound' },
              { value: 'CHF', label: 'Fr CHF — Swiss Franc' },
              { value: 'PLN', label: 'zł PLN — Polish Zloty' },
              { value: 'SEK', label: 'kr SEK — Swedish Krona' },
              { value: 'DKK', label: 'kr DKK — Danish Krone' },
              { value: 'NOK', label: 'kr NOK — Norwegian Krone' },
              { value: 'CZK', label: 'Kč CZK — Czech Koruna' },
              { value: 'HUF', label: 'Ft HUF — Hungarian Forint' },
            ]}
          />
          <SelectRow
            label="Date format"
            description="How dates appear throughout the app"
            value={dateFormat}
            onChange={setDateFormat}
            options={[
              { value: 'dd.MM.yyyy', label: '02.06.2026 (DD.MM.YYYY)' },
              { value: 'MM/dd/yyyy', label: '06/02/2026 (MM/DD/YYYY)' },
              { value: 'yyyy-MM-dd', label: '2026-06-02 (YYYY-MM-DD)' },
              { value: 'dd/MM/yyyy', label: '02/06/2026 (DD/MM/YYYY)' },
            ]}
          />
          <SelectRow
            label="Number format"
            description="Decimal and thousand separators"
            value="de"
            onChange={() => {}}
            options={[
              { value: 'de', label: '1.234,56 (German)' },
              { value: 'en', label: '1,234.56 (English)' },
              { value: 'fr', label: '1 234,56 (French)' },
            ]}
          />
        </div>
      </Card>

      <Card>
        <SectionHeader>Language & region</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <SelectRow
            label="App language"
            description="Interface language"
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'en', label: 'English' },
              { value: 'de', label: 'Deutsch' },
              { value: 'fr', label: 'Français' },
              { value: 'es', label: 'Español' },
              { value: 'it', label: 'Italiano' },
              { value: 'pt', label: 'Português' },
              { value: 'nl', label: 'Nederlands' },
              { value: 'pl', label: 'Polski' },
            ]}
          />
          <SelectRow
            label="Timezone"
            description="Used for transaction timestamps and statements"
            value={timezone}
            onChange={setTimezone}
            options={[
              { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
              { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
              { value: 'Europe/Paris', label: 'Central European Time (CET)' },
              { value: 'America/New_York', label: 'Eastern Time (ET)' },
              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
              { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
              { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
            ]}
          />
        </div>
      </Card>

      <Card>
        <SectionHeader>Statements & exports</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <SelectRow
            label="Statement format"
            description="Format for monthly account statements"
            value={statementFormat}
            onChange={setStatementFormat}
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'csv', label: 'CSV' },
              { value: 'mt940', label: 'MT940 (SWIFT)' },
              { value: 'camt053', label: 'CAMT.053 (ISO 20022)' },
            ]}
          />
          <SelectRow
            label="Statement delivery"
            description="How you receive your statements"
            value="digital"
            onChange={() => {}}
            options={[
              { value: 'digital', label: 'Digital only (in-app)' },
              { value: 'email', label: 'Email + in-app' },
            ]}
          />
        </div>
      </Card>

      <Card>
        <SectionHeader>Banking features</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <NotifToggle
            title="Round-up savings"
            description="Round up card payments and save the difference"
            defaultOn={roundUpSavings}
          />
          <NotifToggle
            title="Instant payment notifications"
            description="Push notification for every transaction immediately"
            defaultOn={instantNotifications}
          />
          <NotifToggle
            title="Analytics & insights"
            description="Categorize spending and show monthly reports"
            defaultOn
          />
          <NotifToggle
            title="Open Banking connections"
            description="Allow third-party apps to access account data (PSD2)"
            defaultOn={false}
          />
        </div>
      </Card>

      <Card>
        <SectionHeader>Transaction limits</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <DetailRow label="Daily transfer limit" value="€50,000" />
          <DetailRow label="Single transfer limit" value="€25,000" />
          <DetailRow label="Daily card spending" value="€10,000" />
          <DetailRow label="ATM withdrawal (daily)" value="€2,000" />
          <DetailRow label="Contactless limit" value="€50 per tap" />
        </div>
        <p className="text-xs text-atlas-text-secondary mt-4">
          Contact support to request limit increases.
        </p>
      </Card>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader>Authentication</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-atlas-bg-subtle flex items-center justify-center">
                <svg className="w-[18px] h-[18px] text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium">Email login (OTP)</p>
                <p className="text-xs text-atlas-text-secondary">One-time code sent to your email</p>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-atlas-bg-subtle flex items-center justify-center">
                <svg className="w-[18px] h-[18px] text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium">Biometric authentication</p>
                <p className="text-xs text-atlas-text-secondary">Face ID or fingerprint on mobile</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Enable</Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader>Active sessions</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <SessionRow device="MacBook Pro" location="Berlin, Germany" current />
          <SessionRow device="iPhone 15 Pro" location="Berlin, Germany" />
          <SessionRow device="Chrome on Windows" location="Munich, Germany" />
        </div>
      </Card>
    </div>
  );
}

function NotificationsSection() {
  return (
    <Card>
      <SectionHeader>Preferences</SectionHeader>
      <div className="divide-y divide-atlas-border/50">
        <NotifToggle title="Transaction alerts" description="Every card transaction" defaultOn />
        <NotifToggle title="Large transactions" description="Transactions over €500" defaultOn />
        <NotifToggle title="Money received" description="Incoming transfers" defaultOn />
        <NotifToggle title="Card security" description="Suspicious activity alerts" defaultOn />
        <NotifToggle title="Product updates" description="New features" defaultOn={false} />
        <NotifToggle title="Marketing" description="Promotions and offers" defaultOn={false} />
      </div>
    </Card>
  );
}

function DocumentsSection() {
  const docs = [
    { name: 'Account statement — May 2026', date: 'Jun 1, 2026' },
    { name: 'Account statement — April 2026', date: 'May 1, 2026' },
    { name: 'Account statement — March 2026', date: 'Apr 1, 2026' },
    { name: 'Tax certificate 2025', date: 'Jan 15, 2026' },
  ];

  return (
    <Card>
      <SectionHeader>Your documents</SectionHeader>
      <div className="divide-y divide-atlas-border/50">
        {docs.map((doc) => (
          <div
            key={doc.name}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-atlas-error/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-atlas-error">PDF</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{doc.name}</p>
              <p className="text-xs text-atlas-text-secondary">{doc.date}</p>
            </div>
            <svg
              className="w-4 h-4 text-atlas-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SupportSection() {
  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader>Contact us</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <SupportRow
            icon="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
            title="Phone support"
            description="Mon–Fri 8:00–20:00 CET"
            action="+49 30 1234 5678"
          />
          <SupportRow
            icon="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            title="Email support"
            description="Typically responds within 2 hours"
            action="support@atlasbank.eu"
          />
          <SupportRow
            icon="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            title="Live chat"
            description="Available 24/7 for urgent issues"
            action="Start chat"
          />
        </div>
      </Card>

      <Card>
        <SectionHeader>Quick help</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <HelpLink label="How to transfer money" />
          <HelpLink label="Card blocked or lost" />
          <HelpLink label="Dispute a transaction" />
          <HelpLink label="Update personal details" />
          <HelpLink label="Download tax documents" />
          <HelpLink label="Understanding fees" />
        </div>
        <div className="mt-4 pt-4 border-t border-atlas-border/50">
          <a
            href="/help"
            className="text-[13px] font-medium text-atlas-accent hover:text-atlas-accent/80 transition-colors"
          >
            Visit full Help Center →
          </a>
        </div>
      </Card>

      <Card>
        <SectionHeader>Report a problem</SectionHeader>
        <p className="text-[13px] text-atlas-text-secondary leading-relaxed mb-4">
          Found a bug or experiencing an issue? Let us know and we&apos;ll look into it.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">Report a bug</Button>
          <Button variant="ghost" size="sm">Give feedback</Button>
        </div>
      </Card>

      <Card>
        <SectionHeader>App info</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          <DetailRow label="App version" value="2.4.1" />
          <DetailRow label="Last updated" value="May 28, 2026" />
          <DetailRow label="Device" value="Web browser" />
          <DetailRow label="Session ID" value="sess_8f2k…x9m1" />
        </div>
      </Card>
    </div>
  );
}

function LegalSection() {
  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader>Regulatory information</SectionHeader>
        <p className="text-[13px] text-atlas-text-secondary leading-relaxed">{REGULATORY_DISCLOSURE}</p>
      </Card>

      <Card>
        <SectionHeader>Legal documents</SectionHeader>
        <div className="divide-y divide-atlas-border/50">
          {([
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Legal Notice', href: '/legal' },
          ] as const).map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-[13px] font-medium text-atlas-text-primary hover:text-atlas-accent transition-colors"
            >
              {label}
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-[13px] text-atlas-text-secondary">{label}</span>
      <span className="flex items-center gap-2 text-[13px] font-medium text-atlas-text-primary">{value}</span>
    </div>
  );
}

function SessionRow({ device, location, current }: { device: string; location: string; current?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-atlas-bg-subtle flex items-center justify-center">
          <svg className="w-4 h-4 text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-medium">{device}</p>
          <p className="text-xs text-atlas-text-secondary">{location}</p>
        </div>
      </div>
      {current ? (
        <Badge variant="success">Current</Badge>
      ) : (
        <button className="text-xs text-atlas-error hover:opacity-70 transition-opacity font-medium">
          Revoke
        </button>
      )}
    </div>
  );
}

function NotifToggle({ title, description, defaultOn }: { title: string; description: string; defaultOn?: boolean }) {
  const [enabled, setEnabled] = useState(defaultOn ?? true);

  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-[13px] font-medium">{title}</p>
        <p className="text-xs text-atlas-text-secondary">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={clsx(
          'w-[44px] h-[26px] rounded-full relative transition-colors duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex-shrink-0',
          enabled ? 'bg-atlas-accent' : 'bg-atlas-border'
        )}
      >
        <div
          className={clsx(
            'w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            enabled ? 'left-[20px]' : 'left-[2px]'
          )}
        />
      </button>
    </div>
  );
}

function SelectRow({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-xs text-atlas-text-secondary">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[13px] font-medium text-atlas-text-primary bg-atlas-bg-subtle border border-atlas-border/70 rounded-lg px-3 py-1.5 appearance-none cursor-pointer hover:border-atlas-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-atlas-accent/20 focus:border-atlas-accent min-w-[180px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SupportRow({ icon, title, description, action }: { icon: string; title: string; description: string; action: string }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-atlas-bg-subtle flex items-center justify-center flex-shrink-0">
          <svg className="w-[18px] h-[18px] text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-medium">{title}</p>
          <p className="text-xs text-atlas-text-secondary">{description}</p>
        </div>
      </div>
      <span className="text-[13px] font-medium text-atlas-accent whitespace-nowrap">{action}</span>
    </div>
  );
}

function HelpLink({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group cursor-pointer"
    >
      <span className="text-[13px] font-medium text-atlas-text-primary group-hover:text-atlas-accent transition-colors">
        {label}
      </span>
      <svg className="w-3.5 h-3.5 text-atlas-text-secondary group-hover:text-atlas-accent transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </a>
  );
}
