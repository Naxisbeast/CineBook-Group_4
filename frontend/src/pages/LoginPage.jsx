import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MovieImage from '../components/MovieImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';
import { dashboardPathForRole } from '../utils/roles.js';

const posters = [
  ['Sinners', '/fWPgbnt2LSqkQ6cdQc0SZN9CpLm.jpg', '2025-04-18'],
  ['Mission: Impossible - The Final Reckoning', '/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg', '2025-05-23'],
  ['Thunderbolts*', '/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg', '2025-05-02'],
  ['Final Destination: Bloodlines', '/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg', '2025-05-16']
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      setShake(true);
      setTimeout(() => setShake(false), 420);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const { data } = await authApi.login({
        Email: form.email,
        Password: form.password
      });
      login(data.token, data.user);
      navigate(location.state?.from || dashboardPathForRole(data.user?.Role));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in. Please check your details.');
      setShake(true);
      setTimeout(() => setShake(false), 420);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell page-enter grid min-h-screen pt-20 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <MovieImage
          src="https://image.tmdb.org/t/p/w1280/xPNDRM50a58uvv1il2GVZrtWjkZ.jpg"
          alt="Mission: Impossible - The Final Reckoning"
          type="backdrop"
          releaseDate="2025-05-23"
          className="absolute inset-0"
          imageClassName="h-full w-full object-cover"
        />
        <div className="absolute inset-0 z-20 bg-[linear-gradient(90deg,rgba(5,5,6,0.82),rgba(5,5,6,0.35),rgba(5,5,6,0.92))]" />
        <div className="absolute bottom-10 left-10 right-10 z-30">
          <p className="eyebrow">CineBook Access</p>
          <h1 className="section-title mt-3 max-w-xl text-7xl">Your next seat is waiting</h1>
          <div className="mt-6 flex gap-3">
            {posters.map(([title, path, releaseDate], idx) => (
              <MovieImage
                key={title}
                src={`https://image.tmdb.org/t/p/w500${path}`}
                alt={title}
                type="poster"
                releaseDate={releaseDate}
                className="poster-float h-48 w-32 rounded-lg border border-cb-border shadow-2xl"
                style={{ '--poster-rotate': `${idx % 2 ? '-' : ''}${2 + idx}deg`, animationDelay: `${idx * 0.18}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8">
        <form onSubmit={submit} className={`cinema-panel w-full max-w-md p-6 md:p-8 ${shake ? 'animate-[shake_0.32s_ease]' : ''}`}>
          <p className="eyebrow">Welcome Back</p>
          <h1 className="section-title mt-2 text-6xl">Sign In</h1>
          <div className="mt-7 space-y-4">
            <label>
              <span className="input-label">Email</span>
              <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} type="email" className="input-field" autoComplete="email" />
            </label>
            <label>
              <span className="input-label">Password</span>
              <input value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} type="password" className="input-field" autoComplete="current-password" />
            </label>
            {error && <p className="rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={submitting} className="btn-primary w-full disabled:opacity-70">
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-cb-secondary">
            <a href="mailto:support@cinebook.co.za?subject=Password%20Reset%20Request" className="hover:text-cb-accent">Forgot password</a>
            <p>New here? <Link to="/register" className="font-bold text-cb-accent">Create account</Link></p>
          </div>
        </form>
      </section>
    </main>
  );
}
