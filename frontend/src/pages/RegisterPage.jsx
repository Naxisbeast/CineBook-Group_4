import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieImage from '../components/MovieImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';

const posters = [
  ['Lilo & Stitch', '/ckQzKpQJO4ZQDCN5evdpKcfm7Ys.jpg', '2025-05-23'],
  ['Karate Kid: Legends', '/c90Lt7OQGsOmhv6x4JoFdoHzw5l.jpg', '2025-05-30'],
  ['How to Train Your Dragon', '/41dfWUWtg1kUZcJYe6Zk6ewxzMu.jpg', '2025-06-13'],
  ['A Minecraft Movie', '/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg', '2025-04-04']
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const score = useMemo(() => {
    let points = 0;
    if (form.password.length >= 8) points += 1;
    if (/[A-Z]/.test(form.password)) points += 1;
    if (/[0-9]/.test(form.password)) points += 1;
    if (/[^a-zA-Z0-9]/.test(form.password)) points += 1;
    return points;
  }, [form.password]);

  const checks = {
    firstName: form.firstName.length > 1,
    lastName: form.lastName.length > 1,
    email: /.+@.+\..+/.test(form.email),
    password: score >= 2,
    confirmPassword: form.confirmPassword && form.confirmPassword === form.password
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!Object.values(checks).every(Boolean)) {
      setError('Please complete all required fields correctly.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const { data } = await authApi.register({
        First_Name: form.firstName,
        Last_Name: form.lastName,
        Email: form.email,
        Phone_Number: form.phone,
        Password: form.password
      });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell page-enter grid min-h-screen pt-20 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center justify-center px-4 py-8">
        <form onSubmit={submit} className="cinema-panel w-full max-w-xl p-6 md:p-8">
          <p className="eyebrow">Join CineBook</p>
          <h1 className="section-title mt-2 text-6xl">Create Account</h1>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              ['firstName', 'First Name', 'text', 'given-name'],
              ['lastName', 'Last Name', 'text', 'family-name'],
              ['email', 'Email', 'email', 'email'],
              ['phone', 'Phone Number (optional)', 'text', 'tel'],
              ['password', 'Password', 'password', 'new-password'],
              ['confirmPassword', 'Confirm Password', 'password', 'new-password']
            ].map(([key, label, type, autoComplete]) => (
              <label key={key} className={key === 'email' || key === 'phone' ? 'sm:col-span-2' : ''}>
                <span className="input-label">{label}</span>
                <div className="relative">
                  <input
                    type={type}
                    value={form[key]}
                    autoComplete={autoComplete}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="input-field pr-10"
                  />
                  {key in checks && form[key] ? (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black ${checks[key] ? 'text-emerald-300' : 'text-red-300'}`}>
                      {checks[key] ? 'OK' : 'NO'}
                    </span>
                  ) : null}
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`h-2 rounded-full ${idx < score ? 'bg-cb-accent' : 'bg-cb-elevated'}`} />
            ))}
          </div>
          {error && <p className="mt-4 rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={submitting} className="btn-primary mt-5 w-full disabled:opacity-70">
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="mt-4 text-sm text-cb-secondary">Already have an account? <Link to="/login" className="font-bold text-cb-accent">Sign in</Link></p>
        </form>
      </section>

      <section className="relative hidden overflow-hidden lg:block">
        <MovieImage
          src="https://image.tmdb.org/t/p/w1280/79PNOxNXSe5e0bhEj11QJPlsdCN.jpg"
          alt="How to Train Your Dragon"
          type="backdrop"
          releaseDate="2025-06-13"
          className="absolute inset-0"
          imageClassName="h-full w-full object-cover"
        />
        <div className="absolute inset-0 z-20 bg-[linear-gradient(270deg,rgba(5,5,6,0.82),rgba(5,5,6,0.28),rgba(5,5,6,0.92))]" />
        <div className="absolute bottom-10 left-10 right-10 z-30">
          <p className="eyebrow">Reserve. Pay. Watch.</p>
          <h2 className="section-title mt-3 max-w-xl text-7xl">Built for movie nights</h2>
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
    </main>
  );
}
