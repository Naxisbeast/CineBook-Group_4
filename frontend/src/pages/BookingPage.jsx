import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingSummary from '../components/BookingSummary.jsx';
import MovieImage from '../components/MovieImage.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import SeatLegend from '../components/SeatLegend.jsx';
import { bookingsApi, seatsApi } from '../services/api.js';

const PRICE_MULTIPLIER = {
  Standard: 1,
  Premium: 1.25,
  VIP: 1.7
};

export default function BookingPage() {
  const { show_id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSeats() {
      try {
        setLoading(true);
        setError('');
        const { data } = await seatsApi.byShow(show_id);
        if (!cancelled) {
          setMovie(data.movie);
          setShow(data.show);
          setSeats(data.seats || []);
          setSelected([]);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Unable to load this show.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSeats();
    return () => {
      cancelled = true;
    };
  }, [show_id]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked' || !show) return;

    const exists = selected.some((item) => item.Seat_Id === seat.Seat_Id);
    if (exists) {
      setSelected((prev) => prev.filter((item) => item.Seat_Id !== seat.Seat_Id));
      return;
    }

    const multiplier = PRICE_MULTIPLIER[seat.Seat_Type] || PRICE_MULTIPLIER.Standard;
    setSelected((prev) => [
      ...prev,
      { ...seat, price: Math.round(Number(show.Price_Per_Seat) * multiplier) }
    ]);
  };

  const total = useMemo(
    () => selected.reduce((sum, seat) => sum + seat.price, 0),
    [selected]
  );

  const confirm = async () => {
    if (!selected.length || !show || !movie) return;

    try {
      setSubmitting(true);
      setError('');
      const { data } = await bookingsApi.create({
        show_id: Number(show_id),
        seat_ids: selected.map((seat) => seat.Seat_Id)
      });

      const bookingDraft = {
        booking_id: data.booking_id,
        reference: `CB-${data.booking_id}`,
        movie,
        show,
        seats: selected,
        total: Number(data.total_amount)
      };

      localStorage.setItem('cinebook_pending_payment', JSON.stringify(bookingDraft));
      navigate('/payment', { state: bookingDraft });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create booking.');
      if (err.response?.status === 409) {
        const { data } = await seatsApi.byShow(show_id);
        setSeats(data.seats || []);
        setSelected([]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="min-h-screen pt-32 text-center text-cb-secondary">Loading seats...</main>;
  if (!show || !movie) return <main className="min-h-screen pt-32 text-center text-cb-secondary">{error || 'Show not found.'}</main>;

  return (
    <main className="page-enter pb-28 pt-24 lg:pb-20">
      <section className="page-shell">
        <div className="cinema-panel grid gap-4 p-4 md:grid-cols-[92px_1fr_auto] md:items-center">
          <MovieImage src={movie.Poster_Url} alt={movie.Title} type="poster" releaseDate={movie.Release_Date} className="hidden aspect-[2/3] rounded-md md:block" />
          <div>
            <p className="eyebrow">Seat Selection</p>
            <h1 className="section-title mt-1 text-4xl md:text-5xl">{movie.Title}</h1>
            <p className="mt-1 text-sm text-cb-secondary">
              {new Date(show.Show_DateTime).toLocaleString()} - {show.Theatre_Name} - {show.Screen_Type}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs md:min-w-[300px]">
            {['1 Seats', '2 Payment', '3 Ticket'].map((step, idx) => (
              <div key={step} className={`rounded-md border px-3 py-2 ${idx === 0 ? 'border-cb-accent bg-cb-accent text-black' : 'border-cb-border text-cb-secondary'}`}>
                {step}
              </div>
            ))}
          </div>
        </div>
        {error && <p className="mt-4 rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
      </section>

      <section className="page-shell mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <SeatGrid seats={seats} selected={selected} onToggle={toggleSeat} />
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SeatLegend />
            <p className="text-sm text-cb-secondary">Base price R{show.Price_Per_Seat}; premium seat types adjust automatically.</p>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cb-border bg-[#080809]/96 p-4 backdrop-blur lg:static lg:border-none lg:bg-transparent lg:p-0">
          <BookingSummary
            movie={movie}
            show={show}
            selected={selected}
            total={total}
            onConfirm={confirm}
            submitting={submitting}
          />
        </div>
      </section>
    </main>
  );
}
