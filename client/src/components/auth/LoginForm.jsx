import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth'

export const LoginForm = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setError('Enter a 6-digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      login(mobileNumber);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-surface-slate border border-surface-border p-8 rounded-2xl shadow-xl w-full"
    >
      <h2 className="text-heading-lg text-text-primary mb-2 text-2xl">Welcome back</h2>
      <p className="text-body text-text-secondary mb-8">Use your mobile number and 6-digit PIN to continue.</p>

      {error && (
        <div className="mb-4 p-3 bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">MOBILE NUMBER</label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={mobileNumber}
            onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">6-DIGIT PIN</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-text-primary text-canvas-black rounded-button py-3 mt-4 font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Continue to Dashboard
        </button>
      </form>
    </motion.div>
  );
};
