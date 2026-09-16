import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle, Sparkles, Users, ShieldCheck, TrendingUp, Shield } from 'lucide-react';
import { Role } from '../types';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern [background-size:32px_32px] opacity-20" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-20 -left-20 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-float [animation-delay:2s]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">SupervisorMatch</span>
          </Link>
          <div>
            <h2 className="font-display text-3xl font-extrabold leading-tight">
              Find your ideal<br />research supervisor
            </h2>
            <p className="mt-4 max-w-sm text-primary-100">
              Our intelligent matching system connects students with faculty based on shared research interests and availability.
            </p>
            <div className="mt-10 space-y-4">
              <BrandFeature icon={<Sparkles className="h-5 w-5" />} text="Weighted interest matching algorithm" />
              <BrandFeature icon={<Users className="h-5 w-5" />} text="Browse faculty research directories" />
              <BrandFeature icon={<TrendingUp className="h-5 w-5" />} text="Real-time slot availability tracking" />
              <BrandFeature icon={<ShieldCheck className="h-5 w-5" />} text="Secure role-based accounts" />
            </div>
          </div>
          <p className="text-sm text-primary-200">University Supervisor Recommendation System</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-neutral-50 to-white px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-soft">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
              Supervisor<span className="text-gradient">Match</span>
            </span>
          </Link>
          <div className="card p-8 shadow-soft">
            <h1 className="font-display text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandFeature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
        {icon}
      </div>
      <span className="text-sm font-medium text-primary-50">{text}</span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password, selectedRole);
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      navigate(
        selectedRole === 'admin'
          ? '/admin-dashboard'
          : selectedRole === 'faculty'
            ? '/faculty-dashboard'
            : '/dashboard',
      );
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your university account.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorBanner message={error} />}
        <div>
          <span className="label">Sign in as</span>
          <div className="grid grid-cols-3 gap-2">
            <LoginRoleTab
              active={selectedRole === 'student'}
              onClick={() => setSelectedRole('student')}
              icon={<Users className="h-4 w-4" />}
              label="Student"
            />
            <LoginRoleTab
              active={selectedRole === 'faculty'}
              onClick={() => setSelectedRole('faculty')}
              icon={<Users className="h-4 w-4" />}
              label="Faculty"
            />
            <LoginRoleTab active={selectedRole === 'admin'} onClick={() => setSelectedRole('admin')}
              icon={<Shield className="h-4 w-4" />} label="Admin" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input id="email" type="email" autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@university.edu" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input id="password" type="password" autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {selectedRole === 'student' ? <p className="mt-6 text-center text-sm text-neutral-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">Create one</Link>
      </p> : <p className="mt-6 text-center text-sm text-neutral-500">Faculty and Admin accounts are managed by System Administrator.</p>}
    </AuthShell>
  );
}

function LoginRoleTab({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-semibold transition-colors ${
        active
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}
