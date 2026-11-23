import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, User, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const redirectTarget = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Please enter your full legal name as per PAN records.');
      return;
    }

    if (password.length < 8) {
      setError('Security requirement: Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured() || !supabase) {
      setError('Authentication service is not configured. Please verify environment settings.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data?.session) {
          setSuccessMsg('Account created successfully! Redirecting to your borrower portal...');
          setTimeout(() => {
            navigate(redirectTarget || '/customer/dashboard');
          }, 1200);
          return;
        }

        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
        setMode('login');
        setPassword('');
        setLoading(false);
      } else {
        // Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        const role = roleRow?.role || 'customer';
        const isStaff = ['underwriter', 'reviewer', 'super_admin'].includes(role);

        setLoading(false);
        if (redirectTarget) {
          navigate(redirectTarget);
        } else if (isStaff) {
          navigate('/admin/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      console.error('Supabase Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Institutional Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white font-display font-bold text-xl mb-4 shadow-[0_0_25px_rgba(249,115,22,0.5)]">
            N
          </div>
          <h2 className="font-display font-bold text-3xl text-white tracking-tight">
            {mode === 'login' ? 'Sign in to NIRNAY' : 'Create Applicant Account'}
          </h2>
          <p className="mt-1.5 text-xs text-zinc-400 font-medium">
            Hero Housing Finance Automated Underwriting Engine
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-orange-500/30 text-orange-400 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_#f97316]"></span>
            <span>Institutional GoTrue Authentication Active</span>
          </div>
        </div>

        {/* Frosted Glass Login Card (Modeled on User Reference Image) */}
        <div className="mt-7 glass-card py-8 px-6 sm:px-8 rounded-3xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          
          {/* Mode Switcher Pills */}
          <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/[0.08] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'btn-orange shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'btn-orange shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Legal Name (as per PAN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sneha Kulkarni"
                    className="glass-input w-full text-xs pl-10 pr-4 py-3 rounded-xl placeholder-zinc-500"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Institutional / Borrower Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="glass-input w-full text-xs pl-10 pr-4 py-3 rounded-xl placeholder-zinc-500"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="glass-input w-full text-xs pl-10 pr-4 py-3 rounded-xl placeholder-zinc-500"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-orange w-full mt-2 py-3.5 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with GoTrue...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In Securely' : 'Register Applicant Account'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fills for Testing */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Test Credentials
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setEmail('test.applicant@nirnay.io');
                  setPassword('ApplicantTest#2026');
                }}
                className="glass-pill p-2 rounded-xl text-center hover:border-orange-500/40 hover:text-orange-400 transition-all font-medium text-zinc-300"
              >
                Test Borrower
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setEmail('test.underwriter@nirnay.io');
                  setPassword('UnderwriterTest#2026');
                }}
                className="glass-pill p-2 rounded-xl text-center hover:border-orange-500/40 hover:text-orange-400 transition-all font-medium text-zinc-300"
              >
                Test Underwriter
              </button>
            </div>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 text-center text-[11px] text-zinc-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>Protected by PostgreSQL Row Level Security &amp; DPDP Act, 2023</span>
          </p>
          <p>Hero Housing Finance Limited &bull; Institutional Lending Portal</p>
        </div>

      </div>
    </div>
  );
}
