'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Props {
  email: string;
  onComplete: (token: string) => void;
  onBack: () => void;
}

export function VerifyStep({ email, onComplete, onBack }: Props) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(fullCode?: string) {
    const codeStr = fullCode || code.join('');
    if (codeStr.length !== 6) return;

    setError('');
    setLoading(true);

    try {
      const { token } = await api.verifyOtp(email, codeStr);
      api.setToken(token);
      onComplete(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm">
      <h1 className="text-2xl font-medium text-center mb-2">Check your email</h1>
      <p className="text-atlas-text-secondary text-center mb-8">
        We sent a 6-digit code to <strong className="text-atlas-text-primary">{email}</strong>
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-medium border border-atlas-border rounded-xl focus:outline-none focus:ring-2 focus:ring-atlas-accent focus:border-transparent"
          />
        ))}
      </div>

      {error && <p className="text-sm text-atlas-error text-center mb-4">{error}</p>}

      {loading && (
        <p className="text-sm text-atlas-text-secondary text-center mb-4">Verifying...</p>
      )}

      <div className="flex justify-between items-center mt-6">
        <button onClick={onBack} className="text-sm text-atlas-text-secondary hover:text-atlas-text-primary">
          Use a different email
        </button>
        <Button variant="ghost" size="sm" onClick={() => api.sendOtp(email)}>
          Resend code
        </Button>
      </div>
    </div>
  );
}
