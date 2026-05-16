import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieImage from './MovieImage.jsx';

export default function MovieHero({ movies }) {
  const featured = movies.slice(0, 4);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % featured.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [featured.length]);

  const movie = featured[active];

  if (!movie) {
    return (
      <section className="flex min-h-[520px] items-center justify-center">
        <p className="text-cb-secondary">Loading cinema...</p>
      </section>
    );
  }

  return (
    <section className="relative min-h-[660px] overflow-hidden md:min-h-[700px]">
      <div key={movie.Movie_Id} className="hero-fade hero-kenburns absolute inset-0">
        <MovieImage
          src={movie.Backdrop_Url || movie.Poster_Url}
          alt={movie.Title}
          type="backdrop"
          priority
          className="absolute inset-0"
          imageClassName="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,0.95)_0%,rgba(5,5,6,0.78)_34%,rgba(5,5,6,0.25)_62%,rgba(5,5,6,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.12)_0%,rgba(5,5,6,0.34)_45%,#050506_100%)]" />
      </div>

      <div className="page-shell relative z-10 flex min-h-[660px] items-end pb-10 pt-28 md:min-h-[700px] md:pb-12">
        <div className="grid w-full items-end gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Now Showing</p>
            <h1 className="section-title mt-4 text-6xl md:text-8xl lg:text-9xl">{movie.Title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-cb-secondary md:text-lg">
              {movie.Tagline || movie.Description || 'Reserve your seat for a premium CineBook screening.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="chip border-cb-accent/60 text-cb-accent">{movie.Genre}</span>
              <span className="chip">{movie.Age_Rating}</span>
              <span className="chip">{movie.Duration_Minutes} min</span>
              <span className="chip">{Number(movie.Rating || 4).toFixed(1)} rating</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={`/movie/${movie.Movie_Id}`} className="btn-primary min-w-[150px]">Book Tickets</Link>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.Title} trailer`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary min-w-[150px]"
              >
                Watch Trailer
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="cinema-panel p-3">
              <p className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.18em] text-cb-secondary">Featured</p>
              <div className="grid gap-2">
                {featured.map((item, idx) => (
                  <button
                    key={item.Movie_Id}
                    onClick={() => setActive(idx)}
                    className={`grid grid-cols-[58px_1fr] items-center gap-3 rounded-lg border p-2 text-left transition ${idx === active ? 'border-cb-accent bg-cb-accent/10' : 'border-transparent hover:border-cb-border hover:bg-white/5'}`}
                  >
                    <MovieImage src={item.Poster_Url} alt={item.Title} type="poster" priority className="aspect-[2/3] rounded-md" />
                    <span>
                      <span className="block line-clamp-2 text-sm font-bold">{item.Title}</span>
                      <span className="mt-1 block text-xs text-cb-secondary">{item.Genre} - {item.Duration_Minutes} min</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
