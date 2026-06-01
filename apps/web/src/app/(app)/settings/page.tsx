'use client';

import { Button } from '@/components/ui/button';
import { REGULATORY_DISCLOSURE } from '@atlas-bank/shared';

export default function SettingsPage() {
  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <h1 className="text-2xl font-medium mb-8">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-2xl border border-atlas-border p-6 mb-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Personal details</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-atlas-text-secondary">Name</span>
            <span className="text-sm">Alex Johnson</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-atlas-text-secondary">Email</span>
            <span className="text-sm">alex@example.com</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-atlas-text-secondary">Residence</span>
            <span className="text-sm">Germany</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-atlas-text-secondary">KYC status</span>
            <span className="text-xs bg-green-50 text-atlas-success px-2 py-1 rounded-full">Verified</span>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-white rounded-2xl border border-atlas-border p-6 mb-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Security</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-sm">Active sessions</p>
              <p className="text-xs text-atlas-text-secondary">Manage your logged-in devices</p>
            </div>
            <Button variant="ghost" size="sm">Manage</Button>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-sm">Notifications</p>
              <p className="text-xs text-atlas-text-secondary">Email and push notification preferences</p>
            </div>
            <Button variant="ghost" size="sm">Configure</Button>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="bg-white rounded-2xl border border-atlas-border p-6 mb-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Documents</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm">Account statements</span>
            <Button variant="ghost" size="sm">Download</Button>
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="bg-white rounded-2xl border border-atlas-border p-6 mb-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Legal</h2>
        <p className="text-xs text-atlas-text-secondary leading-relaxed">{REGULATORY_DISCLOSURE}</p>
      </section>

      {/* Danger zone */}
      <section className="bg-white rounded-2xl border border-atlas-error/30 p-6">
        <h2 className="text-sm font-medium text-atlas-error mb-4">Close account</h2>
        <p className="text-xs text-atlas-text-secondary mb-4">
          Closing your account will permanently deactivate your IBAN and card. Any remaining balance must be transferred out first.
        </p>
        <Button variant="ghost" size="sm" className="text-atlas-error hover:bg-red-50">
          Close my account
        </Button>
      </section>
    </div>
  );
}
