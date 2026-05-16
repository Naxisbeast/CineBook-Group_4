import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/api.js';

const roles = ['Customer', 'Administrator', 'Cinema Manager', 'System Administrator'];
const statuses = ['pending', 'confirmed', 'cancelled'];

const emptyMovie = {
  Title: '',
  Genre: '',
  Duration_Minutes: '',
  Age_Rating: '',
  Release_Date: '',
  Rating: '',
  Description: '',
  Cast_Info: '',
  Poster_Url: '',
  Backdrop_Url: '',
  Language: 'English',
  Tagline: ''
};

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

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [lookups, setLookups] = useState({ theatres: [], screens: [] });
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userDrafts, setUserDrafts] = useState({});
  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [showForm, setShowForm] = useState(emptyShow);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');
      const [summaryRes, lookupsRes, usersRes, moviesRes, showsRes, bookingsRes] = await Promise.all([
        adminApi.summary(),
        adminApi.lookups(),
        adminApi.users.all(),
        adminApi.movies.all(),
        adminApi.shows.all(),
        adminApi.bookings.all()
      ]);

      setSummary(summaryRes.data);
      setLookups(lookupsRes.data);
      setUsers(usersRes.data || []);
      setMovies(moviesRes.data || []);
      setShows(showsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load administrator data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const drafts = {};
    users.forEach((user) => {
      drafts[user.User_Id] = {
        Role: user.Role,
        Theatre_Id: user.Theatre_Id || ''
      };
    });
    setUserDrafts(drafts);
  }, [users]);

  const totals = summary?.totals || {};
  const upcomingShows = useMemo(() => shows.slice(0, 8), [shows]);
  const recentBookings = useMemo(() => bookings.slice(0, 8), [bookings]);

  function setDraft(userId, field, value) {
    setUserDrafts((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [field]: value
      }
    }));
  }

  async function saveUserRole(userId) {
    const draft = userDrafts[userId];
    if (!draft) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminApi.users.updateRole(userId, {
        Role: draft.Role,
        Theatre_Id: draft.Role === 'Cinema Manager' ? draft.Theatre_Id : null
      });
      setMessage('User role updated.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update user role.');
    } finally {
      setSaving(false);
    }
  }

  async function createMovie(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminApi.movies.create(movieForm);
      setMovieForm(emptyMovie);
      setMessage('Movie added to the catalogue.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create movie.');
    } finally {
      setSaving(false);
    }
  }

  async function removeMovie(movieId) {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminApi.movies.remove(movieId);
      setMessage('Movie removed.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to remove movie.');
    } finally {
      setSaving(false);
    }
  }

  async function createShow(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminApi.shows.create(showForm);
      setShowForm(emptyShow);
      setMessage('Show schedule created.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create show schedule.');
    } finally {
      setSaving(false);
    }
  }

  async function removeShow(showId) {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminApi.shows.remove(showId);
      setMessage('Show schedule removed.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to remove show schedule.');
    } finally {
      setSaving(false);
    }
  }

  async function updateBookingStatus(bookingId, status) {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminApi.bookings.updateStatus(bookingId, { Status: status });
      setMessage('Booking status updated.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update booking.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="page-shell pt-28 text-center text-cb-secondary">Loading administrator dashboard...</main>;
  }

  return (
    <main className="page-enter page-shell pb-20 pt-28">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1 className="section-title mt-2 text-5xl md:text-6xl">Operations Dashboard</h1>
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

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={money(totals.revenue)} />
        <StatCard label="Bookings" value={totals.booking_count || 0} />
        <StatCard label="Users" value={totals.user_count || 0} />
        <StatCard label="Shows" value={totals.show_count || 0} />
      </section>

      <section className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={createMovie} className="cinema-panel p-5">
          <h2 className="section-title text-4xl">Add Movie</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input required placeholder="Title" value={movieForm.Title} onChange={(e) => setMovieForm((prev) => ({ ...prev, Title: e.target.value }))} className="input-field" />
            <input required placeholder="Genre" value={movieForm.Genre} onChange={(e) => setMovieForm((prev) => ({ ...prev, Genre: e.target.value }))} className="input-field" />
            <input required type="number" min="1" placeholder="Duration" value={movieForm.Duration_Minutes} onChange={(e) => setMovieForm((prev) => ({ ...prev, Duration_Minutes: e.target.value }))} className="input-field" />
            <input required placeholder="Age Rating" value={movieForm.Age_Rating} onChange={(e) => setMovieForm((prev) => ({ ...prev, Age_Rating: e.target.value }))} className="input-field" />
            <input type="date" value={movieForm.Release_Date} onChange={(e) => setMovieForm((prev) => ({ ...prev, Release_Date: e.target.value }))} className="input-field" />
            <input type="number" min="0" max="5" step="0.1" placeholder="Rating" value={movieForm.Rating} onChange={(e) => setMovieForm((prev) => ({ ...prev, Rating: e.target.value }))} className="input-field" />
          </div>
          <textarea placeholder="Description" value={movieForm.Description} onChange={(e) => setMovieForm((prev) => ({ ...prev, Description: e.target.value }))} className="input-field mt-3 min-h-24" />
          <textarea placeholder="Cast" value={movieForm.Cast_Info} onChange={(e) => setMovieForm((prev) => ({ ...prev, Cast_Info: e.target.value }))} className="input-field mt-3 min-h-20" />
          <button disabled={saving} className="btn-primary mt-4 w-full disabled:opacity-60">Add Movie</button>
        </form>

        <form onSubmit={createShow} className="cinema-panel p-5">
          <h2 className="section-title text-4xl">Create Show</h2>
          <div className="mt-4 grid gap-3">
            <select required value={showForm.Movie_Id} onChange={(e) => setShowForm((prev) => ({ ...prev, Movie_Id: e.target.value }))} className="input-field">
              <option value="">Select movie</option>
              {movies.map((movie) => <option key={movie.Movie_Id} value={movie.Movie_Id}>{movie.Title}</option>)}
            </select>
            <select required value={showForm.Screen_Id} onChange={(e) => setShowForm((prev) => ({ ...prev, Screen_Id: e.target.value }))} className="input-field">
              <option value="">Select screen</option>
              {(lookups.screens || []).map((screen) => (
                <option key={screen.Screen_Id} value={screen.Screen_Id}>
                  {screen.Theatre_Name} - {screen.Screen_Name} ({screen.Screen_Type})
                </option>
              ))}
            </select>
            <input required type="datetime-local" value={showForm.Show_DateTime} onChange={(e) => setShowForm((prev) => ({ ...prev, Show_DateTime: e.target.value }))} className="input-field" />
            <input required type="number" min="0" step="0.01" placeholder="Price per seat" value={showForm.Price_Per_Seat} onChange={(e) => setShowForm((prev) => ({ ...prev, Price_Per_Seat: e.target.value }))} className="input-field" />
          </div>
          <button disabled={saving} className="btn-primary mt-4 w-full disabled:opacity-60">Create Show</button>
        </form>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="cinema-panel table-shell p-5">
          <h2 className="section-title text-4xl">Movie Catalogue</h2>
          <div className="mt-4 max-h-[420px] overflow-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-cb-secondary">
                <tr>
                  <th className="py-2">Title</th>
                  <th>Genre</th>
                  <th>Age</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.Movie_Id} className="border-t border-cb-border">
                    <td className="py-3">{movie.Title}</td>
                    <td>{movie.Genre}</td>
                    <td>{movie.Age_Rating}</td>
                    <td className="text-right">
                      <button onClick={() => removeMovie(movie.Movie_Id)} disabled={saving} className="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-200 transition hover:bg-red-500/10 disabled:opacity-60">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cinema-panel p-5">
          <h2 className="section-title text-4xl">Upcoming Shows</h2>
          <div className="mt-4 space-y-3">
            {upcomingShows.map((show) => (
              <article key={show.Show_Id} className="rounded-lg border border-cb-border bg-[#0b0b10] p-3 transition hover:border-cb-accent/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{show.Movie_Title}</p>
                    <p className="text-xs text-cb-secondary">{show.Theatre_Name} - {show.Screen_Name}</p>
                    <p className="text-xs text-cb-secondary">{formatDateTime(show.Show_DateTime)}</p>
                  </div>
                  <button onClick={() => removeShow(show.Show_Id)} disabled={saving} className="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-200 transition hover:bg-red-500/10 disabled:opacity-60">Remove</button>
                </div>
                <p className="mt-2 text-xs text-cb-accent">{show.Seats_Remaining} seats left - {money(show.Price_Per_Seat)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-panel table-shell mt-8 p-5">
        <h2 className="section-title text-4xl">Users And Roles</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-cb-secondary">
              <tr>
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Theatre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const draft = userDrafts[user.User_Id] || {};
                return (
                  <tr key={user.User_Id} className="border-t border-cb-border">
                    <td className="py-3">{user.First_Name} {user.Last_Name}</td>
                    <td>{user.Email}</td>
                    <td>
                      <select value={draft.Role || user.Role} onChange={(e) => setDraft(user.User_Id, 'Role', e.target.value)} className="rounded-md border border-cb-border bg-black/40 px-2 py-1">
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        value={draft.Theatre_Id || ''}
                        onChange={(e) => setDraft(user.User_Id, 'Theatre_Id', e.target.value)}
                        disabled={draft.Role !== 'Cinema Manager'}
                        className="rounded-md border border-cb-border bg-black/40 px-2 py-1 disabled:opacity-40"
                      >
                        <option value="">None</option>
                        {(lookups.theatres || []).map((theatre) => <option key={theatre.Theatre_Id} value={theatre.Theatre_Id}>{theatre.Name}</option>)}
                      </select>
                    </td>
                    <td className="text-right">
                      <button onClick={() => saveUserRole(user.User_Id)} disabled={saving} className="rounded-md bg-cb-accent px-3 py-1 text-xs font-bold text-black transition hover:bg-[#ffd45a] disabled:opacity-60">Save</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="cinema-panel table-shell mt-8 p-5">
        <h2 className="section-title text-4xl">Recent Bookings</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
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
