import { useEffect, useMemo, useState } from 'react';
import LoyaltyBadge from '../components/LoyaltyBadge.jsx';
import MovieImage from '../components/MovieImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingsApi } from '../services/api.js';

function normalizeBooking(booking) {
  const seats = Array.isArray(booking.Seats)
    ? booking.Seats
    : String(booking.Seats || '')
        .split(',')
        .map((seat) => seat.trim())
        .filter(Boolean);

  return {
    ...booking,
    Seats: seats,
    Status: booking.Booking_Status || booking.Status || 'pending',
    City: booking.City || booking.Theatre_City
  };
}

function statusClass(status) {
  if (status === 'confirmed') return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30';
  if (status === 'pending') return 'bg-cb-accent/20 text-cb-accent border-cb-accent/30';
  return 'bg-red-500/20 text-red-200 border-red-400/30';
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      try {
        setLoading(true);
        setError('');
        const { data } = await bookingsApi.mine();
        if (!cancelled) setBookings((data || []).map(normalizeBooking));
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Unable to load your bookings.');
          setBookings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter((item) => item.Status === filter);
  }, [bookings, filter]);

  const stats = useMemo(() => {
    const total = bookings.reduce((sum, booking) => sum + Number(booking.Total_Amount || 0), 0);
    return {
      totalBookings: bookings.length,
      moviesWatched: new Set(bookings.map((booking) => booking.Movie_Title)).size,
      totalSpent: total
    };
  }, [bookings]);

  const initials = `${user?.First_Name?.[0] || ''}${user?.Last_Name?.[0] || ''}`.toUpperCase();

  return (
    <main className="page-enter pb-20 pt-28">
      <section className="page-shell">
        <div className="cinema-panel overflow-hidden">
          <div className="bg-[linear-gradient(90deg,rgba(244,197,66,0.14),rgba(224,82,63,0.08),transparent)] p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-cb-accent text-3xl font-black text-black">{initials}</div>
              <div>
                <p className="eyebrow">Member Profile</p>
                <h1 className="section-title mt-1 text-5xl">{user?.First_Name} {user?.Last_Name}</h1>
                <p className="text-sm text-cb-secondary">{user?.Email}</p>
                <div className="mt-2"><LoyaltyBadge status={user?.Loyalty_Status} /></div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3 md:p-7">
            <div className="rounded-lg border border-cb-border bg-black/24 p-4 text-sm text-cb-secondary">Total Bookings <p className="mono-font mt-2 text-2xl text-cb-accent">{stats.totalBookings}</p></div>
            <div className="rounded-lg border border-cb-border bg-black/24 p-4 text-sm text-cb-secondary">Movies Watched <p className="mono-font mt-2 text-2xl text-cb-accent">{stats.moviesWatched}</p></div>
            <div className="rounded-lg border border-cb-border bg-black/24 p-4 text-sm text-cb-secondary">Total Spent <p className="mono-font mt-2 text-2xl text-cb-accent">R{stats.totalSpent.toFixed(2)}</p></div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-8">
        <div className="mb-5 flex flex-wrap gap-2">
          <button onClick={() => setTab('bookings')} className={`chip ${tab === 'bookings' ? 'chip-active' : ''}`}>My Bookings</button>
          <button onClick={() => setTab('favourites')} className={`chip ${tab === 'favourites' ? 'chip-active' : ''}`}>Favourites</button>
        </div>

        {tab === 'bookings' ? (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              {['all', 'confirmed', 'pending', 'cancelled'].map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={`chip min-h-9 text-xs ${filter === item ? 'chip-active' : ''}`}>
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="cinema-panel p-10 text-center text-cb-secondary">Loading bookings...</div>
            ) : error ? (
              <div className="rounded-lg border border-red-900/70 bg-red-950/40 p-10 text-center text-red-300">{error}</div>
            ) : visibleBookings.length ? (
              <div className="grid gap-3">
                {visibleBookings.map((booking) => (
                  <article
                    key={booking.Booking_Id}
                    aria-label={`${booking.Movie_Title} booking on ${new Date(booking.Show_DateTime).toLocaleString()}`}
                    className="grid gap-4 rounded-lg border border-cb-border bg-[#101014] p-3 transition hover:border-cb-accent/50 sm:grid-cols-[76px_1fr_auto] sm:items-center"
                  >
                    <MovieImage src={booking.Poster_Url} alt={booking.Movie_Title} type="poster" className="h-28 w-20 rounded-md" />
                    <div>
                      <p className="font-black">{booking.Movie_Title}</p>
                      <p className="mt-1 text-sm text-cb-secondary">{new Date(booking.Show_DateTime).toLocaleString()} - {booking.Theatre_Name}</p>
                      <p className="mt-1 text-sm text-cb-secondary">Seats: {booking.Seats.join(', ') || 'Pending'}</p>
                    </div>
                    <div className="sm:text-right">
                      <span className={`inline-flex rounded-md border px-3 py-1 text-xs font-bold ${statusClass(booking.Status)}`}>{booking.Status}</span>
                      <p className="mono-font mt-3 text-xl text-cb-accent">R{Number(booking.Total_Amount || 0).toFixed(2)}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cinema-panel p-10 text-center text-cb-secondary">
                <p>No bookings yet. Find your next film.</p>
              </div>
            )}
          </>
        ) : (
          <div className="cinema-panel p-10 text-center text-cb-secondary">
            Save movies you love
          </div>
        )}
      </section>
    </main>
  );
}
