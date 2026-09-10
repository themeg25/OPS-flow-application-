import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../api/authService';
import Button from '../components/ui/Button';

// mode: 'login' | 'register' | 'forgot-request' | 'forgot-verify'
export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ identifier: '', name: '', email: '', password: '', mobile: '', role: 'Developer' });
  const [forgot, setForgot] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }
  function setForgotField(k, v) { setForgot(f => ({ ...f, [k]: v })); setError(''); }

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.identifier, form.password);
        navigate('/');
      } else if (mode === 'register') {
        await authService.register(form.name, form.email, form.password, form.mobile, form.role);
        toast.success('Registration submitted — an admin will approve your account.');
        setMode('login');
        setForm(f => ({ ...f, name: '', email: '', password: '', mobile: '', role: 'Developer', identifier: f.email }));
      } else if (mode === 'forgot-request') {
        await authService.requestPasswordReset(forgot.email);
        toast.success('If that email is registered, a reset code has been sent to it.');
        setMode('forgot-verify');
      } else if (mode === 'forgot-verify') {
        if (forgot.newPassword !== forgot.confirmPassword) {
          setError("Passwords don't match.");
          setLoading(false);
          return;
        }
        await authService.resetPassword(forgot.email, forgot.otp, forgot.newPassword);
        toast.success('Password updated — sign in with your email or mobile number.');
        setForm(f => ({ ...f, identifier: forgot.email, password: '' }));
        setForgot({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    login: 'Sign in',
    register: 'Create an account',
    'forgot-request': 'Reset your password',
    'forgot-verify': 'Enter your code'
  };
  const subtitles = {
    login: 'Deployment, access and issue tracking in one place.',
    register: 'New accounts require admin approval.',
    'forgot-request': "We'll email a one-time code to your account's email address.",
    'forgot-verify': `Enter the code we sent to ${forgot.email || 'your email'} and choose a new password.`
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#0B1030]">
      {/* Decorative gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E4CDB] via-[#5A31D8] to-[#0B1030]" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#8B5CF6] opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#22D3EE] opacity-30 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-[#F472B6] opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30">OF</div>
          <span className="font-extrabold text-2xl text-white tracking-tight">OPSFlow</span>
        </div>

        <div className="bg-white/95 backdrop-blur border border-white/40 rounded-2xl shadow-2xl p-6">
          {mode !== 'login' && mode !== 'register' && (
            <button
              onClick={() => switchMode(mode === 'forgot-verify' ? 'forgot-request' : 'login')}
              className="text-xs text-ink-400 hover:text-brand-600 font-medium mb-3 inline-flex items-center gap-1"
            >
              ← Back
            </button>
          )}

          <h1 className="text-lg font-semibold text-ink-900">{titles[mode]}</h1>
          <p className="text-sm text-ink-400 mt-0.5 mb-5">{subtitles[mode]}</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'login' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">Email or mobile number</label>
                  <input required value={form.identifier} onChange={(e) => set('identifier', e.target.value)}
                    placeholder="you@example.com or 9876543210"
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-ink-600">Password</label>
                    <button type="button" onClick={() => switchMode('forgot-request')} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <input required type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
              </>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">Full name</label>
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">Mobile number</label>
                  <input required type="tel" value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">Password</label>
                  <input required type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">Role</label>
                  <select required value={form.role} onChange={(e) => set('role', e.target.value)}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white">
                    <option value="Developer">Developer (DEV)</option>
                    <option value="QA">QA</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                  <p className="text-[11px] text-ink-400 mt-1">This is the role you're requesting — an admin confirms it on approval.</p>
                </div>
              </>
            )}

            {mode === 'forgot-request' && (
              <div>
                <label className="block text-xs font-medium text-ink-600 mb-1.5">Email</label>
                <input required type="email" value={forgot.email} onChange={(e) => setForgotField('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
              </div>
            )}

            {mode === 'forgot-verify' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">6-digit code</label>
                  <input required value={forgot.otp} onChange={(e) => setForgotField('otp', e.target.value)}
                    inputMode="numeric" maxLength={6} placeholder="123456"
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm tracking-[0.3em] text-center font-mono focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">New password</label>
                  <input required type="password" value={forgot.newPassword} onChange={(e) => setForgotField('newPassword', e.target.value)}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1.5">Confirm new password</label>
                  <input required type="password" value={forgot.confirmPassword} onChange={(e) => setForgotField('confirmPassword', e.target.value)}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    try { await authService.requestPasswordReset(forgot.email); toast.success('A new code has been sent.'); }
                    catch (e) { setError(e.message); }
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Didn't get a code? Resend
                </button>
              </>
            )}

            {error && <div className="text-xs text-danger-text bg-danger-bg rounded-lg px-3 py-2">{error}</div>}

            <Button type="submit" loading={loading} className="w-full !bg-gradient-to-r !from-brand-500 !to-[#8B5CF6] hover:!opacity-90" size="lg">
              {mode === 'login' && 'Sign in'}
              {mode === 'register' && 'Submit registration'}
              {mode === 'forgot-request' && 'Send code'}
              {mode === 'forgot-verify' && 'Update password'}
            </Button>
          </form>

          {(mode === 'login' || mode === 'register') && (
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="w-full text-center text-xs text-ink-500 hover:text-brand-600 mt-4 font-medium"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-white/50 mt-6">© {new Date().getFullYear()} OPSFlow</p>
      </div>
    </div>
  );
}
