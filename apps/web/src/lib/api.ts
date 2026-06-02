const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface Jar {
  id: string;
  name: string;
  currency: string;
  balanceCents: number;
  targetCents: number | null;
  emoji: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  // Auth is held in httpOnly cookies set by the API (not readable by JS).
  // We keep a single in-flight refresh promise to avoid stampedes on 401.
  private refreshing: Promise<boolean> | null = null;

  private async request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (res.status === 401 && retry && !path.startsWith('/auth/')) {
      const refreshed = await this.tryRefresh();
      if (refreshed) return this.request<T>(path, options, false);
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshing) {
      this.refreshing = fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => {
          this.refreshing = null;
        });
    }
    return this.refreshing;
  }

  logout() {
    return fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }

  // Auth
  sendOtp(email: string) {
    return this.request<{ sent: boolean }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  verifyOtp(email: string, code: string) {
    return this.request<{ token: string; isNewUser: boolean; expiresIn: number }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  // Onboarding
  startOnboarding(data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    residenceCountry: string;
    residenceAddress: { line1: string; line2?: string; city: string; postalCode: string; country: string };
  }) {
    return this.request<{ onboardingId: string; kycUrl: string; status: string }>('/onboarding/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getOnboardingStatus() {
    return this.request<{ onboardingId: string; status: string; kycUrl?: string }>('/onboarding/status');
  }

  completeOnboarding() {
    return this.request<{
      account: { id: string; iban: string; bic: string; holderName: string };
      card: { id: string; last4: string; type: string };
    }>('/onboarding/complete', { method: 'POST' });
  }

  // Accounts
  getAccount() {
    return this.request<{
      id: string;
      status: string;
      iban: string;
      bic: string;
      holderName: string;
      balance: { amount: number; currency: string };
    }>('/accounts/me');
  }

  getBalance() {
    return this.request<{ amount: number; currency: string }>('/accounts/me/balance');
  }

  getTransactions(cursor?: string, limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request<{ items: any[]; hasNextPage: boolean; cursor?: string }>(
      `/accounts/me/transactions?${params}`
    );
  }

  // Cards
  getCards() {
    return this.request<any[]>('/cards');
  }

  getCardTransactions(cardId: string, cursor?: string, limit = 25) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request<{
      items: {
        id: string;
        cardId: string | null;
        direction: 'inbound' | 'outbound';
        status: string;
        amountCents: number;
        currency: string;
        counterpartyName: string;
        counterpartyIban: string | null;
        reference: string;
        category: string;
        createdAt: string;
      }[];
      hasNextPage: boolean;
      cursor?: string;
    }>(`/cards/${cardId}/transactions?${params}`);
  }

  freezeCard(cardId: string) {
    return this.request(`/cards/${cardId}/freeze`, { method: 'POST' });
  }

  unfreezeCard(cardId: string) {
    return this.request(`/cards/${cardId}/unfreeze`, { method: 'POST' });
  }

  getSecureCardDetails(cardId: string) {
    return this.request<{ url: string; expiresAt: string }>(`/cards/${cardId}/secure-details`);
  }

  provisionWallet(cardId: string, walletType: 'apple_pay' | 'google_pay') {
    return this.request(`/cards/${cardId}/wallet`, {
      method: 'POST',
      body: JSON.stringify({ walletType }),
    });
  }

  renameCard(cardId: string, name: string) {
    return this.request(`/cards/${cardId}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  updateCard(
    cardId: string,
    patch: {
      color?: 'black' | 'white' | 'green';
      name?: string;
      onlineEnabled?: boolean;
      contactlessEnabled?: boolean;
      atmEnabled?: boolean;
      internationalEnabled?: boolean;
      limitCents?: number;
    },
  ) {
    return this.request(`/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  deleteCard(cardId: string) {
    return this.request<{ deleted: true }>(`/cards/${cardId}`, { method: 'DELETE' });
  }

  orderPhysicalCard(deliveryAddress: { line1: string; line2?: string; city: string; postalCode: string; country: string }) {
    return this.request('/cards/physical', {
      method: 'POST',
      body: JSON.stringify({ deliveryAddress }),
    });
  }

  // Payments
  initiateTransfer(data: {
    creditorIban: string;
    creditorName: string;
    amountCents: number;
    reference?: string;
    instant?: boolean;
  }) {
    return this.request<{ paymentId: string; consentUrl: string; status: string }>('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getPaymentStatus(paymentId: string) {
    return this.request(`/payments/${paymentId}/status`);
  }

  getTransferDetails(paymentId: string) {
    return this.request<{
      id: string;
      status: 'initiated' | 'processing' | 'in_transit' | 'delivered' | 'failed';
      amountCents: number;
      currency: string;
      creditorName: string;
      creditorIban: string;
      reference?: string;
      createdAt: string;
      updatedAt: string;
    }>(`/payments/${paymentId}/details`);
  }

  // GDPR
  async exportMyData() {
    const res = await fetch(`${API_BASE}/gdpr/export`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to export data');
    return res.json();
  }

  deleteMyAccount() {
    return this.request<{ deleted: true }>('/gdpr/account', { method: 'DELETE' });
  }

  // Top-up / funding
  getTopUpInstructions() {
    return this.request<{
      currency: string;
      iban: string;
      bic: string;
      holderName: string;
      reference: string;
      methods: { name: string; processingTime: string; cost: string }[];
    }[]>('/top-up/instructions');
  }

  simulateTopUp(amountCents: number, currency = 'EUR') {
    return this.request<{ credited: number; currency: string; transactionId: string }>('/top-up/simulate', {
      method: 'POST',
      body: JSON.stringify({ amountCents, currency }),
    });
  }

  // Multi-currency accounts
  getAllAccounts() {
    return this.request<{
      id: string;
      status: string;
      iban: string;
      bic: string;
      holderName: string;
      currency: string;
      balance: { amount: number; currency: string };
    }[]>('/accounts/all');
  }

  openAccount(currency: string) {
    return this.request<{
      id: string;
      status: string;
      iban: string;
      bic: string;
      holderName: string;
      currency: string;
      balance: { amount: number; currency: string };
    }>('/accounts/open', {
      method: 'POST',
      body: JSON.stringify({ currency }),
    });
  }

  // Savings jars (currency-scoped pots)
  getJars() {
    return this.request<Jar[]>('/jars');
  }

  createJar(data: {
    name: string;
    currency: string;
    emoji?: string;
    color?: string;
    targetCents?: number;
    initialDepositCents?: number;
  }) {
    return this.request<Jar>('/jars', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateJar(id: string, data: { name?: string; emoji?: string; color?: string; targetCents?: number }) {
    return this.request<Jar>(`/jars/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  moveJarFunds(id: string, amountCents: number, direction: 'in' | 'out') {
    return this.request<Jar>(`/jars/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ amountCents, direction }),
    });
  }

  deleteJar(id: string) {
    return this.request<{ deleted: true; returnedCents: number }>(`/jars/${id}`, {
      method: 'DELETE',
    });
  }

  // Recipients
  getRecipients() {
    return this.request<{
      id: string;
      name: string;
      iban: string;
      bic?: string;
      bank?: string;
      country?: string;
      email?: string;
      phone?: string;
      notes?: string;
      isFavorite: boolean;
      createdAt: string;
    }[]>('/recipients');
  }

  createRecipient(data: { name: string; iban: string; bic?: string; bank?: string; country?: string; email?: string; phone?: string; notes?: string }) {
    return this.request<{ id: string; name: string; iban: string }>('/recipients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateRecipient(id: string, data: { name?: string; isFavorite?: boolean; bank?: string; bic?: string; country?: string; email?: string; phone?: string; notes?: string }) {
    return this.request(`/recipients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteRecipient(id: string) {
    return this.request(`/recipients/${id}`, { method: 'DELETE' });
  }

  // Payment Requests
  getPaymentRequests() {
    return this.request<{
      id: string;
      amountCents: number;
      currency: string;
      recipientEmail?: string;
      note?: string;
      status: string;
      token: string;
      expiresAt?: string;
      paidAt?: string;
      paidByName?: string;
      createdAt: string;
    }[]>('/payment-requests');
  }

  createPaymentRequest(data: { amountCents: number; currency?: string; recipientEmail?: string; note?: string }) {
    return this.request<{ id: string; token: string; status: string }>('/payment-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  cancelPaymentRequest(id: string) {
    return this.request(`/payment-requests/${id}/cancel`, { method: 'PATCH' });
  }

  getPaymentRequestByToken(token: string) {
    return this.request<{
      id: string;
      amountCents: number;
      currency: string;
      note?: string;
      status: string;
      requesterName: string;
      requesterHandle?: string | null;
      expiresAt?: string;
    }>(`/payment-requests/pay/${token}`);
  }

  // Payment handles (@handle)
  checkHandleAvailability(handle: string) {
    return this.request<{ handle: string; valid: boolean; available: boolean }>(
      `/handles/availability?handle=${encodeURIComponent(handle)}`,
    );
  }

  getMyHandle() {
    return this.request<{ handle: string | null }>('/handles/me');
  }

  claimHandle(handle: string) {
    return this.request<{ handle: string }>('/handles/me', {
      method: 'PATCH',
      body: JSON.stringify({ handle }),
    });
  }

  resolveHandle(handle: string) {
    return this.request<{ handle: string; name: string; iban: string; bic: string }>(
      `/handles/${encodeURIComponent(handle.replace(/^@+/, ''))}`,
    );
  }

  // Currency conversion
  getExchangeRates() {
    return this.request<{ baseCurrency: string; targetCurrency: string; rate: number }[]>('/convert/rates');
  }

  getConversionQuote(from: string, to: string, amountCents: number) {
    return this.request<{
      from: string;
      to: string;
      amountCents: number;
      feeCents: number;
      feeRate: number;
      rate: number;
      convertedCents: number;
      expiresIn: number;
    }>(`/convert/quote?from=${from}&to=${to}&amount=${amountCents}`);
  }

  executeConversion(data: { from: string; to: string; amountCents: number }) {
    return this.request<{ status: string; convertedCents: number; rate: number }>('/convert', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
