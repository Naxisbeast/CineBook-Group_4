import { Link } from 'react-router-dom';
import MovieImage from './MovieImage.jsx';

function ratingLabel(rating = 0) {
  const value = Number(rating || 0);
  return value ? value.toFixed(1) : 'New';
}

export default function MovieCard({ movie, index = 0 }) {
  return (
    <Link
      to={`/movie/${movie.Movie_Id}`}
      className="card-reveal card-hover group block overflow-hidden rounded-lg border border-cb-border bg-[#0d0d11]"
      style={{ animationDelay: `${Math.min(index * 55, 420)}ms` }}
      aria-label={`View details for ${movie.Title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-cb-elevated">
        <MovieImage
          src={movie.Poster_Url}
          alt={movie.Title}
          type="poster"
          priority={index < 5}
          className="h-full w-full"
          imageClassName="transition duration-500 group-hover:scale-105 group-hover:brightness-110"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
          <span className="rounded-md bg-black/72 px-2 py-1 text-[11px] font-bold text-cb-accent">{movie.Age_Rating}</span>
          <span className="rounded-md bg-black/72 px-2 py-1 text-[11px] font-bold">{ratingLabel(movie.Rating)}</span>
        </div>
        <div className="absolute inset-0 flex translate-y-4 flex-col justify-end bg-[linear-gradient(180deg,transparent_28%,rgba(0,0,0,0.88)_100%)] p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cb-accent">{movie.Genre}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-black leading-tight">{movie.Title}</h3>
          <p className="mt-1 text-xs text-cb-secondary">{movie.Duration_Minutes} min</p>
          <span className="btn-primary mt-4 min-h-10 text-sm">Book Now</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="truncate font-bold">{movie.Title}</h3>
        <div className="mt-2 flex items-center justify-between text-xs text-cb-secondary">
          <span>{movie.Genre}</span>
          <span className="mono-font text-cb-accent">{ratingLabel(movie.Rating)}</span>
        </div>
      </div>
    </Link>
  );
}
