import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-cb-border bg-[#070708]/92">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Link to="/" className="display-font text-3xl">
            <span className="text-cb-accent">CINE</span> BOOK
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-cb-secondary">
            Premium movie discovery, seat selection, and ticket booking for a modern cinema experience.
          </p>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <div className="mt-3 grid gap-2 text-sm text-cb-secondary">
            <a href="/#now-showing" className="hover:text-cb-text">Now Showing</a>
            <a href="/#coming-soon" className="hover:text-cb-text">Coming Soon</a>
            <Link to="/profile" className="hover:text-cb-text">My Tickets</Link>
          </div>
        </div>

        <div>
          <p className="eyebrow">CineBook</p>
          <div className="mt-3 grid gap-2 text-sm text-cb-secondary">
            <span>Johannesburg</span>
            <span>Cape Town</span>
            <span>Pretoria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
