import { useState } from 'react';
import * as Separator from '@radix-ui/react-separator';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/ui/Button.jsx';
import Field from '../components/ui/Field.jsx';
import Input from '../components/ui/Input.jsx';
import Toasts from '../components/ui/Toasts.jsx';

export default function Login() {
  const { login, signup, addToast } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', name: '', address: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = mode === 'login'
      ? await login(form.username, form.password)
      : await signup(form);
    setIsSubmitting(false);

    if (!result.success) {
      addToast(result.message, 'error');
      return;
    }

    addToast(mode === 'login' ? 'Logged in successfully.' : 'Account created successfully.', 'success');
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between bg-slate-950 px-4 py-6 text-white sm:px-10 lg:px-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/das-digital-logo.jpeg" alt="DAS Digital Profile" className="h-10 w-10 rounded-full object-cover ring-1 ring-cyan-300/50 sm:h-12 sm:w-12" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-200 sm:text-sm">DAS Digital</p>
              <p className="text-xs text-slate-400">Smart online services</p>
            </div>
          </div>
          <div className="my-8 max-w-xl sm:my-16">
            <img
              src="/das-digital-logo.jpeg"
              alt="DAS Digital Profile"
              className="mb-6 aspect-square w-full max-w-64 rounded-full object-cover shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-300/30 sm:mb-8 sm:max-w-80"
            />
            <h1 className="text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">Pay power bills from a prepaid wallet.</h1>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            {[
              ['Wallet first', 'Prepaid balance controls bill payment'],
              ['Fast & Efficient', 'One click approvals and payments'],
              ['Cashback and Offers', 'Refunds and Exciting Discounts on payments'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-md border border-white/10 bg-white/5 p-3 sm:p-4">
                <p className="text-xs font-semibold sm:text-sm">{title}</p>
                <p className="mt-1 text-xs leading-4 text-slate-400 sm:leading-5">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-700 sm:text-sm">{mode === 'login' ? 'Sign in' : 'Sign up'}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950 sm:mt-2 sm:text-2xl">
                {mode === 'login' ? 'Open your billing workspace' : 'Create your account to manage prepay balance'}
              </h2>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <Field label="Username">
                <Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </Field>
              <Field label="Password">
                <Input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Field>
              {mode === 'signup' && (
                <>
                  <Field label="Full name">
                    <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </Field>
                  <Field label="Address">
                    <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </Field>
                  <Field label="Phone no">
                    <Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Email ID">
                    <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </Field>
                </>
              )}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                <ShieldCheck className="h-4 w-4" />
                {isSubmitting ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign up')}
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 sm:mt-4 sm:text-sm">
              <span>{mode === 'login' ? 'New to DAS Digital?' : 'Already have an account?'}</span>
              <button
                type="button"
                className="font-semibold text-cyan-700 hover:text-cyan-900"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </div>
            <Separator.Root className="my-4 h-px bg-slate-200 sm:my-6" />
            <div className="grid gap-2 text-xs sm:grid-cols-2 sm:gap-3 sm:text-sm">
              <button type="button" className="rounded-md bg-slate-100 p-2 text-left sm:p-3" onClick={() => setForm({ username: 'user', password: 'user123', name: '', address: '', phone: '', email: '' })}>
                <span className="font-bold text-slate-900">User demo</span>
                <span className="block text-slate-500">user / user123</span>
              </button>
              <button type="button" className="rounded-md bg-slate-100 p-2 text-left sm:p-3" onClick={() => setForm({ username: 'admin', password: 'admin123', name: '', address: '', phone: '', email: '' })}>
                <span className="font-bold text-slate-900">Admin demo</span>
                <span className="block text-slate-500">admin / admin123</span>
              </button>
            </div>
          </form>
        </section>
      </div>
      <Toasts />
    </main>
  );
}
