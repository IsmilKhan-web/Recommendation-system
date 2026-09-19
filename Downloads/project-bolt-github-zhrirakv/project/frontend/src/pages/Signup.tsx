import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building2 } from 'lucide-react';
import { AuthShell, ErrorBanner } from './Login';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    const { error } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      role: 'student',
      department: department.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
     <AuthShell title="Create your account" subtitle="Register as a student to get started.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input id="fullName" type="text" required value={fullName}
              onChange={(e) => setFullName(e.target.value)} className="input pl-10" placeholder="Jane Doe" />
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
          <label className="label" htmlFor="department">Department</label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <select id="department" value={department}
              onChange={(e) => setDepartment(e.target.value)} className="input-select pl-10">
              <option value="">Select your department (optional)</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="IT">IT</option>
              <option value="Data Science">Data Science</option>
              <option value="AI">AI</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input id="password" type="password" autoComplete="new-password" required value={password}
              onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="At least 6 characters" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
      </p>
    </AuthShell>
  );
}
