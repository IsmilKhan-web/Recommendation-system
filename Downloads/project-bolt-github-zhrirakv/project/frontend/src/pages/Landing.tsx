import { Link } from 'react-router-dom';
import { GraduationCap, Users, Sparkles, ShieldCheck, ArrowRight, TrendingUp, BookOpen, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern [background-size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent-200/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-60 -left-40 h-80 w-80 rounded-full bg-primary-200/20 blur-3xl animate-float [animation-delay:2s]" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-neutral-900">
            Supervisor<span className="text-gradient">Match</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm">Get started</Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-primary-50 text-primary-700 ring-1 ring-primary-100 animate-fade-in">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Smart supervisor matching
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-6xl animate-slide-up">
              Find the perfect{' '}
              <span className="text-gradient bg-[length:200%_auto] animate-gradient-shift">
                research supervisor
              </span>{' '}
              for your interests
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 animate-slide-up stagger-1">
              Tell us what you're passionate about. Our matching algorithm connects students with faculty whose research areas align — and shows you who still has open slots.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-slide-up stagger-2">
              <Link to="/signup" className="btn-primary text-base px-7 py-3">
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-7 py-3">I already have one</Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-4 animate-slide-up stagger-3">
            <StatCard value="20+" label="Research areas" />
            <StatCard value="6" label="Faculty members" />
            <StatCard value="1-5" label="Priority weights" />
          </div>

          {/* Feature cards */}
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Browse faculty"
              text="Explore faculty profiles, their research areas, and real-time slot availability."
              color="primary"
              delay="stagger-4"
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Weighted matching"
              text="Rank your interests by priority. The algorithm weights both your interest and the faculty's expertise."
              color="accent"
              delay="stagger-5"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Role-based access"
              text="Separate student and faculty experiences with secure, role-scoped accounts."
              color="primary"
              delay="stagger-6"
            />
          </div>

          {/* How it works */}
          <div className="mt-20 text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900">How it works</h2>
            <p className="mx-auto mt-2 max-w-xl text-neutral-600">Three simple steps from signup to your matched supervisor.</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <StepCard step="01" icon={<BookOpen className="h-5 w-5" />} title="Select your interests" text="Browse 20+ research areas and weight each by priority." />
            <StepCard step="02" icon={<Zap className="h-5 w-5" />} title="We match you" text="The algorithm scores every faculty member based on overlap and availability." />
            <StepCard step="03" icon={<TrendingUp className="h-5 w-5" />} title="View your rankings" text="Get a ranked list with match scores and open slot counts." />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-12 text-center shadow-glow animate-scale-in">
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern [background-size:32px_32px] opacity-20" />
            <div className="relative">
              <h2 className="font-display text-3xl font-extrabold text-white">Ready to find your supervisor?</h2>
              <p className="mx-auto mt-3 max-w-lg text-primary-100">
                Create an account in seconds and get personalized recommendations immediately.
              </p>
              <Link to="/signup" className="btn-accent mt-8 bg-white text-primary-700 hover:bg-primary-50 px-7 py-3 text-base">
                Get started for free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-200/60 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-bold text-neutral-700">SupervisorMatch</span>
          </div>
          <p className="text-xs text-neutral-400">University Supervisor Recommendation System</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-5 text-center">
      <p className="font-display text-3xl font-extrabold text-gradient">{value}</p>
      <p className="mt-1 text-xs font-medium text-neutral-500">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text, color, delay }: {
  icon: React.ReactNode; title: string; text: string; color: 'primary' | 'accent'; delay: string;
}) {
  return (
    <div className={`card-hover p-6 animate-slide-up ${delay}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
        color === 'primary' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' : 'bg-gradient-to-br from-accent-500 to-accent-600 text-white'
      }`}>
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
    </div>
  );
}

function StepCard({ step, icon, title, text }: {
  step: string; icon: React.ReactNode; title: string; text: string;
}) {
  return (
    <div className="relative card p-6 animate-slide-up">
      <span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-neutral-100">{step}</span>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        {icon}
      </div>
      <h3 className="relative mt-4 font-display text-base font-bold text-neutral-900">{title}</h3>
      <p className="relative mt-1.5 text-sm leading-relaxed text-neutral-600">{text}</p>
    </div>
  );
}
