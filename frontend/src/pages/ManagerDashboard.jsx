import { useEffect, useMemo, useState } from 'react';
import { managerApi } from '../services/api.js';

const statuses = ['pending', 'confirmed', 'cancelled'];

const emptyShow = {
  Movie_Id: '',
  Screen_Id: '',
  Show_DateTime: '',
  Price_Per_Seat: ''
};

function money(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Date(String(value).replace(' ', 'T')).toLocaleString();
}

function StatCard({ label, value }) {
  return (
    <div className="elevated-panel p-4">
      <p className="eyebrow text-[0.68rem]">{label}</p>
      <p className="mono-font mt-2 text-2xl text-cb-accent">{value}</p>
    </div>
  );
}

function StatusPill({ value }) {
  const color = value === 'confirmed'
    ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-200'
    : value === 'pending'
      ? 'border-cb-accent/30 bg-cb-accent/20 text-cb-accent'
      : 'border-red-400/30 bg-red-500/20 text-red-200';
  return <span className={`rounded-md border px-3 py-1 text-xs font-bold capitalize ${color}`}>{value || 'unknown'}</span>;
}

export default function ManagerDashboard() {
  const [summary, setSummary] = useState(null);
  const [lookups, setLookups] = useState({ theatre: null, movies: [], screens: [] });
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(emptyShow);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');
      const [summaryRes, lookupsRes, showsRes, bookingsRes] = await Promise.all([
        managerApi.summary(),
        managerApi.lookups(),
        managerApi.shows.all(),
        managerApi.bookings.all()
      ]);

      setSummary(summaryRes.data);
      setLookups(lookupsRes.data);
      setShows(showsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load manager data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totals = summary?.totals || {};
  const theatre = summary?.theatre || lookups.theatre;
  const upcomingShows = useMemo(() => shows.slice(0, 10), [shows]);
  const recentBookings = useMemo(() => bookings.slice(0, 10), [bookings]);

  async function createShow(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await managerApi.shows.create(showForm);
      setShowForm(emptyShow);
      setMessage('Show schedule created for your theatre.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create show schedule.');
    } finally {
      setSaving(false);
    }
  }

  async function updateBookingStatus(bookingId, status) {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await managerApi.bookings.updateStatus(bookingId, { Status: status });
      setMessage('Booking status updated.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update booking.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="page-shell pt-28 text-center text-cb-secondary">Loading manager dashboard...</main>;
  }

  return (
    <main className="page-enter page-shell pb-20 pt-28">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Cinema Manager</p>
          <h1 className="section-title mt-2 text-5xl md:text-6xl">{theatre?.Theatre_Name || 'Theatre'} Dashboard</h1>
          <p className="text-sm text-cb-secondary">{theatre?.Theatre_City}</p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={saving}
          className="btn-secondary text-sm disabled:opacity-60"
        >
          Refresh
        </button>
      </header>

      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {message && <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Revenue" value={money(totals.revenue)} />
        <StatCard label="Bookings" value={totals.booking_count || 0} />
        <StatCard label="Pending" value={totals.pending_bookings || 0} />
        <StatCard label="Shows" value={totals.show_count || 0} />
        <StatCard label="Screens" value={totals.screen_count || 0} />
      </section>

      <section className="mt-8 grid items-start gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={createShow} className="cinema-panel p-5">
          <h2 className="section-title text-4xl">Schedule Show</h2>
          <div className="mt-4 grid gap-3">
            <select required value={showForm.Movie_Id} onChange={(e) => setShowForm((prev) => ({ ...prev, Movie_Id: e.target.value }))} className="input-field">
              <option value="">Select movie</option>
              {(lookups.movies || []).map((movie) => <option key={movie.Movie_Id} value={movie.Movie_Id}>{movie.Title}</option>)}
            </select>
            <select required value={showForm.Screen_Id} onChange={(e) => setShowForm((prev) => ({ ...prev, Screen_Id: e.target.value }))} className="input-field">
              <option value="">Select screen</option>
              {(lookups.screens || []).map((screen) => (
                <option key={screen.Screen_Id} value={screen.Screen_Id}>
                  {screen.Screen_Name} ({screen.Screen_Type})
                </option>
              ))}
            </select>
            <input required type="datetime-local" value={showForm.Show_DateTime} onChange={(e) => setShowForm((prev) => ({ ...prev, Show_DateTime: e.target.value }))} className="input-field" />
            <input required type="number" min="0" step="0.01" placeholder="Price per seat" value={showForm.Price_Per_Seat} onChange={(e) => setShowForm((prev) => ({ ...prev, Price_Per_Seat: e.target.value }))} className="input-field" />
          </div>
          <button disabled={saving} className="btn-primary mt-4 w-full disabled:opacity-60">Create Show</button>
        </form>

        <div className="cinema-panel p-5">
          <h2 className="section-title text-4xl">Theatre Schedule</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {upcomingShows.map((show) => (
              <article key={show.Show_Id} className="rounded-lg border border-cb-border bg-[#0b0b10] p-3 transition hover:border-cb-accent/50">
                <p className="font-semibold">{show.Movie_Title}</p>
                <p className="text-xs text-cb-secondary">{show.Screen_Name} - {show.Screen_Type}</p>
                <p className="text-xs text-cb-secondary">{formatDateTime(show.Show_DateTime)}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-cb-accent">{show.Seats_Remaining} seats left</span>
                  <span>{money(show.Price_Per_Seat)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-panel table-shell mt-8 p-5">
        <h2 className="section-title text-4xl">Theatre Bookings</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-cb-secondary">
              <tr>
                <th className="py-2">Customer</th>
                <th>Movie</th>
                <th>Show</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.Booking_Id} className="border-t border-cb-border">
                  <td className="py-3">{booking.First_Name} {booking.Last_Name}</td>
                  <td>{booking.Movie_Title}</td>
                  <td>{formatDateTime(booking.Show_DateTime)}</td>
                  <td>{booking.Seats || 'None'}</td>
                  <td>{money(booking.Total_Amount)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <StatusPill value={booking.Status} />
                      <select value={booking.Status} onChange={(e) => updateBookingStatus(booking.Booking_Id, e.target.value)} className="rounded-md border border-cb-border bg-black/40 px-2 py-1">
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
