import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import MovieImage from '../components/MovieImage.jsx';
import ShowCard from '../components/ShowCard.jsx';
import { MOCK_MOVIES, MOCK_SHOWS } from '../data/mockData.js';
import { moviesApi } from '../services/api.js';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateLabel(dateString, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateString);
  return `${days[date.getDay()]} ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
}

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMovie() {
      try {
        setLoading(true);
        setError('');
        const { data } = await moviesApi.byId(id);
        if (!cancelled) {
          setMovie(data.movie);
          setShows(data.shows || []);
        }
      } catch {
        if (!cancelled) {
          setMovie(MOCK_MOVIES.find((item) => String(item.Movie_Id) === id) || null);
          setShows(MOCK_SHOWS.filter((show) => String(show.Movie_Id) === id));
          setError('Backend unavailable. Showing sample movie data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMovie();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const grouped = useMemo(() => {
    return shows.reduce((acc, show) => {
      const key = show.Show_DateTime.slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(show);
      return acc;
    }, {});
  }, [shows]);

  const dateKeys = useMemo(() => Object.keys(grouped), [grouped]);
  const [activeDate, setActiveDate] = useState('');

  useEffect(() => {
    if (!activeDate && dateKeys.length) setActiveDate(dateKeys[0]);
    if (activeDate && !dateKeys.includes(activeDate)) setActiveDate(dateKeys[0] || '');
  }, [activeDate, dateKeys]);

  if (loading) return <main className="min-h-screen pt-32 text-center text-cb-secondary">Loading movie...</main>;
  if (!movie) return <main className="min-h-screen pt-32 text-center text-cb-secondary">Movie not found.</main>;

  const cast = (movie.Cast_Info || '').split(',').map((name) => name.trim()).filter(Boolean);

  return (
    <main className="page-enter pb-20 pt-28">
      <section className="page-shell">
        <div className="cinema-panel relative overflow-hidden p-5 md:p-7">
          <MovieImage
            src={movie.Backdrop_Url || movie.Poster_Url}
            alt={movie.Title}
            type="backdrop"
            releaseDate={movie.Release_Date}
            className="absolute inset-0 opacity-45"
            imageClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 z-20 bg-[linear-gradient(90deg,#050506_0%,rgba(5,5,6,0.9)_46%,rgba(5,5,6,0.52)_100%)]" />
          <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(5,5,6,0.22),#050506_100%)]" />

          <div className="relative z-30 grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-end">
            <MovieImage
              src={(movie.Poster_Url || '').replace('/w500/', '/w342/')}
              alt={movie.Title}
              type="poster"
              releaseDate={movie.Release_Date}
              className="hidden aspect-[2/3] rounded-lg border border-cb-border shadow-2xl lg:block"
            />

            <div>
              <p className="eyebrow">Movie Details</p>
              <h1 className="section-title mt-3 max-w-4xl text-5xl md:text-7xl">{movie.Title}</h1>
              {error && <p className="mt-3 rounded-lg border border-cb-accent/30 bg-cb-accent/10 p-3 text-sm text-cb-accent">{error}</p>}
              <p className="mt-4 max-w-3xl text-base leading-7 text-cb-secondary md:text-lg">{movie.Description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip chip-active">{movie.Genre}</span>
                <span className="chip">{movie.Age_Rating}</span>
                <span className="chip">{movie.Duration_Minutes} min</span>
                <span className="chip">{movie.Language || 'English'}</span>
                <span className="chip">{Number(movie.Rating || 4).toFixed(1)} rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="cinema-panel p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Tickets</p>
              <h2 className="section-title mt-2 text-5xl">Select A Show</h2>
            </div>
            <p className="text-sm text-cb-secondary">{shows.length} available showtimes</p>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {dateKeys.map((key, idx) => (
              <button key={key} onClick={() => setActiveDate(key)} className={`chip ${activeDate === key ? 'chip-active' : ''}`}>
                {dateLabel(key, idx)}
              </button>
            ))}
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {(grouped[activeDate] || []).map((show) => <ShowCard key={show.Show_Id} show={show} />)}
            {!dateKeys.length && <p className="rounded-lg border border-cb-border p-6 text-sm text-cb-secondary">No upcoming shows are available.</p>}
          </div>
        </div>

        <aside className="elevated-panel p-5">
          <p className="eyebrow">Cast</p>
          <h2 className="section-title mt-2 text-4xl">Featured Talent</h2>
          <div className="mt-4 grid gap-2">
            {cast.slice(0, 8).map((name) => (
              <div key={name} className="rounded-lg border border-cb-border bg-black/20 p-3 text-sm">{name}</div>
            ))}
            {!cast.length && <p className="text-sm text-cb-secondary">Cast information coming soon.</p>}
          </div>
        </aside>
      </section>
    </main>
  );
}
