import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, avatarColorFor } from '../lib/utils';
import { GraduationCap, LogOut, LayoutDashboard, Users, Sparkles, Search, ClipboardList, Shield } from 'lucide-react';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const studentLinks = (
    <>
      <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active={location.pathname === '/dashboard'} />
      <NavLink to="/search" icon={<Search className="h-4 w-4" />} label="Topic Search" active={location.pathname === '/search'} />
      <NavLink to="/faculty" icon={<Users className="h-4 w-4" />} label="Browse Faculty" active={location.pathname === '/faculty'} />
      <NavLink to="/supervisions" icon={<ClipboardList className="h-4 w-4" />} label="List of Supervisions" active={location.pathname === '/supervisions'} />
      <NavLink to="/recommendations" icon={<Sparkles className="h-4 w-4" />} label="My Matches" active={location.pathname === '/recommendations'} />
    </>
  );

  const facultyLinks = (
    <>
      <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="My Profile" active={location.pathname === '/dashboard'} />
      <NavLink to="/faculty" icon={<Users className="h-4 w-4" />} label="All Faculty" active={location.pathname === '/faculty'} />
    </>
  );
  const adminLinks = <NavLink to="/admin-dashboard" icon={<Shield className="h-4 w-4" />} label="Admin Dashboard" active={location.pathname === '/admin-dashboard'} />;

  const links = profile?.role === 'student' ? studentLinks : profile?.role === 'admin' ? adminLinks : facultyLinks;

  return (
    <header className="sticky top-0 z-40 glass border-b border-neutral-200/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-neutral-900">
            Supervisor<span className="text-gradient">Match</span>
          </span>
        </Link>

        {profile && (
          <nav className="hidden items-center gap-1 md:flex">
            {links}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${avatarColorFor(profile.id)}`}>
                  {getInitials(profile.full_name)}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-neutral-800">{profile.full_name}</p>
                  <p className="text-xs capitalize text-neutral-500">{profile.role}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="btn-secondary !px-3 !py-2 text-sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) :  (
            <Link to="/login" className="btn-primary text-sm">Sign in</Link>
          )}
        </div>
      </div>

      {profile && (
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-neutral-100 px-4 py-2 md:hidden">
          {links}
        </nav>
      )}
    </header>
  );
}

function NavLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
