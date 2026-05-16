import { useEffect, useMemo, useState } from 'react';
import MovieCard from '../components/MovieCard.jsx';
import MovieHero from '../components/MovieHero.jsx';
import MovieImage from '../components/MovieImage.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { MOCK_MOVIES } from '../data/mockData.js';
import { moviesApi } from '../services/api.js';

function releaseLabel(date) {
  if (!date) return 'Coming soon';
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HomePage() {
  const [genre, setGenre] = useState('All');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
      try {
        setLoading(true);
        setError('');
        const { data } = await moviesApi.all();
        if (!cancelled) setMovies(data);
      } catch {
        if (!cancelled) {
          setMovies(MOCK_MOVIES);
          setError('Backend unavailable. Showing sample movie data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceMovies = movies.length ? movies : MOCK_MOVIES;

  const genres = useMemo(
    () => ['All', ...Array.from(new Set(sourceMovies.map((movie) => movie.Genre).filter(Boolean)))],
    [sourceMovies]
  );

  const filtered = useMemo(
    () => (genre === 'All' ? sourceMovies : sourceMovies.filter((movie) => movie.Genre === genre)),
    [genre, sourceMovies]
  );

  const spotlight = useMemo(
    () => [...sourceMovies].sort((a, b) => Number(b.Rating || 0) - Number(a.Rating || 0)).slice(0, 3),
    [sourceMovies]
  );

  const comingSoon = useMemo(
    () => [...sourceMovies].sort((a, b) => new Date(a.Release_Date) - new Date(b.Release_Date)).slice(0, 8),
    [sourceMovies]
  );

  return (
    <div className="page-enter pb-20">
      <MovieHero movies={sourceMovies} />

      <section className="page-shell -mt-10 grid gap-3 md:grid-cols-3">
        {spotlight.map((movie) => (
          <article key={movie.Movie_Id} className="cinema-panel grid grid-cols-[78px_1fr] gap-3 p-3">
            <MovieImage src={movie.Poster_Url} alt={movie.Title} type="poster" priority className="aspect-[2/3] rounded-md" />
            <div className="min-w-0 self-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cb-accent">Spotlight</p>
              <h3 className="mt-1 truncate font-black">{movie.Title}</h3>
              <p className="mt-1 text-xs text-cb-secondary">{movie.Genre} - {movie.Duration_Minutes} min</p>
            </div>
          </article>
        ))}
      </section>

      <section id="now-showing" className="page-shell mt-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="section-title mt-2 text-5xl md:text-6xl">Now Showing</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-cb-secondary">
            Curated releases, fast showtime discovery, and a seat-first booking flow built for repeat visits.
          </p>
        </div>
        <div className="hairline mt-5" />
        {error && <p className="mt-4 rounded-lg border border-cb-accent/30 bg-cb-accent/10 p-3 text-sm text-cb-accent">{error}</p>}

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {genres.map((item) => (
            <button
              key={item}
              onClick={() => setGenre(item)}
              className={`chip ${item === genre ? 'chip-active' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading
            ? Array.from({ length: 10 }).map((_, idx) => <SkeletonCard key={idx} />)
            : filtered.map((movie, idx) => <MovieCard key={movie.Movie_Id} movie={movie} index={idx} />)}
        </div>
      </section>

      <section id="coming-soon" className="page-shell mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Next</p>
            <h2 className="section-title mt-2 text-5xl md:text-6xl">Coming Soon</h2>
          </div>
        </div>
        <div className="mt-7 flex gap-4 overflow-x-auto pb-4">
          {comingSoon.map((movie) => (
            <article key={movie.Movie_Id} className="card-hover min-w-[190px] overflow-hidden rounded-lg border border-cb-border bg-[#0d0d11] sm:min-w-[230px]">
              <div className="relative aspect-[2/3] overflow-hidden">
                <MovieImage src={movie.Poster_Url} alt={movie.Title} type="poster" releaseDate={movie.Release_Date} className="h-full w-full grayscale transition duration-500 hover:grayscale-0" />
                <span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[11px] font-bold text-cb-accent">{releaseLabel(movie.Release_Date)}</span>
              </div>
              <div className="p-3">
                <p className="truncate font-bold">{movie.Title}</p>
                <p className="mt-1 text-xs text-cb-secondary">{movie.Genre}</p>
                <button disabled className="btn-secondary mt-3 min-h-9 w-full text-xs opacity-70">Notify Me</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
