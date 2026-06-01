const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('atlas_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('atlas_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('atlas_token');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  sendOtp(email: string) {
    return this.request<{ sent: boolean }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  verifyOtp(email: string, code: string) {
    return this.request<{ token: string; isNewUser: boolean }>('/auth/otp/verify', {
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

  orderPhysicalCard() {
    return this.request('/cards/physical', { method: 'POST' });
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
}

export const api = new ApiClient();
