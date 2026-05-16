import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole, isAdminRole, isManagerRole } from '../utils/roles.js';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const initials = useMemo(() => {
    if (!user) return 'CB';
    return `${user.First_Name?.[0] || ''}${user.Last_Name?.[0] || ''}`.toUpperCase();
  }, [user]);

  const dashboardLabel = isAdminRole(user?.Role)
    ? 'Admin'
    : isManagerRole(user?.Role)
      ? 'Manager'
      : 'Tickets';

  const solid = scrolled || location.pathname !== '/';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${solid ? 'border-cb-border bg-[#060607]/88 shadow-[0_12px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl' : 'border-transparent bg-transparent'}`}>
      <nav className="page-shell flex h-[72px] items-center justify-between py-4">
        <Link to="/" className="group flex items-center gap-3" aria-label="CineBook home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cb-border bg-cb-accent text-sm font-black text-black shadow-[0_0_34px_rgba(244,197,66,0.25)]">CB</span>
          <span className="display-font text-3xl leading-none tracking-normal">
            <span className="text-cb-accent">CINE</span> BOOK
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link to="/" className="btn-ghost text-sm">Home</Link>
          <a href="/#now-showing" className="btn-ghost text-sm">Now Showing</a>
          <a href="/#coming-soon" className="btn-ghost text-sm">Coming Soon</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm">Register</Link>
            </>
          ) : (
            <>
              <button onClick={() => navigate(dashboardPathForRole(user?.Role))} className="btn-secondary h-11 gap-3 px-3 text-sm">
                <span className="hidden text-cb-secondary lg:inline">{dashboardLabel}</span>
                <span className="max-w-[120px] truncate">{user?.First_Name || 'User'}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cb-accent text-xs font-black text-black">{initials}</span>
              </button>
              <button onClick={logout} className="btn-ghost text-sm">Log Out</button>
            </>
          )}
        </div>

        <button
          className="nav-menu-toggle btn-secondary px-3 text-sm"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          Menu
        </button>
      </nav>

      <aside className={`fixed right-0 top-0 h-screen w-80 border-l border-cb-border bg-[#080809] p-6 shadow-2xl transition-transform duration-300 md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div className="display-font text-3xl"><span className="text-cb-accent">CINE</span> BOOK</div>
          <button className="btn-ghost px-3 text-sm" onClick={() => setMenuOpen(false)}>Close</button>
        </div>
        <div className="mt-8 grid gap-3 text-sm">
          <Link to="/" className="btn-secondary justify-start">Home</Link>
          <a href="/#now-showing" className="btn-secondary justify-start">Now Showing</a>
          <a href="/#coming-soon" className="btn-secondary justify-start">Coming Soon</a>
          <div className="my-2 h-px bg-cb-border" />
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn-secondary justify-start">Sign In</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          ) : (
            <>
              <Link to={dashboardPathForRole(user?.Role)} className="btn-secondary justify-start">{dashboardLabel}</Link>
              <button className="btn-secondary justify-start text-left" onClick={logout}>Log Out</button>
            </>
          )}
        </div>
      </aside>
    </header>
  );
}
