import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingConfirmation from '../components/BookingConfirmation.jsx';
import MovieImage from '../components/MovieImage.jsx';
import { paymentsApi } from '../services/api.js';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fallback = localStorage.getItem('cinebook_pending_payment');
  const booking = useMemo(
    () => location.state || (fallback ? JSON.parse(fallback) : null),
    [location.state, fallback]
  );

  const [method, setMethod] = useState('Card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState('');

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-28 text-center">
        <div className="cinema-panel max-w-md p-8">
          <h1 className="section-title text-5xl">No Pending Booking</h1>
          <button onClick={() => navigate('/')} className="btn-primary mt-5">Back Home</button>
        </div>
      </main>
    );
  }

  const pay = async () => {
    try {
      setProcessing(true);
      setError('');
      const { data } = await paymentsApi.create({
        booking_id: booking.booking_id,
        payment_method: method
      });
      localStorage.removeItem('cinebook_pending_payment');
      setConfirmedBooking({
        ...booking,
        reference: data.transaction_reference || booking.reference,
        email_sent: data.email_sent,
        email_status: data.email_status,
        email_message: data.email_message
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment could not be processed.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) return <BookingConfirmation booking={confirmedBooking || booking} />;

  return (
    <main className="page-enter min-h-screen pb-16 pt-28">
      <section className="page-shell grid gap-6 lg:grid-cols-[1fr_430px]">
        <div className="cinema-panel overflow-hidden">
          <div className="relative min-h-[360px]">
            <MovieImage
              src={booking.movie.Backdrop_Url || booking.movie.Poster_Url}
              alt={booking.movie.Title}
              type="backdrop"
              releaseDate={booking.movie.Release_Date}
              className="absolute inset-0"
              imageClassName="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,0.92),rgba(5,5,6,0.55),rgba(5,5,6,0.8))]" />
            <div className="relative z-10 flex min-h-[360px] items-end p-5 md:p-8">
              <div>
                <p className="eyebrow">Secure Checkout</p>
                <h1 className="section-title mt-2 text-6xl md:text-7xl">{booking.movie.Title}</h1>
                <p className="mt-3 text-cb-secondary">{new Date(booking.show.Show_DateTime).toLocaleString()} - {booking.show.Theatre_Name}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-3 md:p-8">
            {booking.seats.map((seat) => (
              <div key={seat.Seat_Id} className="rounded-lg border border-cb-border bg-black/24 p-3">
                <p className="mono-font text-xl text-cb-accent">{seat.Row_Label}{seat.Seat_Number}</p>
                <p className="text-xs text-cb-secondary">{seat.Seat_Type}</p>
                <p className="mt-2 font-bold">R{seat.price}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="cinema-panel p-5 md:p-6">
          <p className="eyebrow">Payment</p>
          <h2 className="section-title mt-2 text-5xl">Confirm Order</h2>
          <div className="mt-5 rounded-lg border border-cb-border bg-black/24 p-4">
            <div className="flex items-center gap-3">
              <MovieImage src={booking.movie.Poster_Url} alt={booking.movie.Title} type="poster" className="h-24 w-16 rounded-md" />
              <div className="min-w-0">
                <p className="truncate font-black">{booking.movie.Title}</p>
                <p className="text-sm text-cb-secondary">{booking.show.Screen_Type}</p>
                <p className="mono-font mt-2 text-2xl text-cb-accent">R{booking.total}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            {[
              ['Card', 'Credit or Debit Card'],
              ['EFT', 'Instant EFT'],
              ['Cash', 'Cash at Counter']
            ].map(([key, label]) => (
              <button key={key} onClick={() => setMethod(key)} className={`rounded-lg border p-3 text-left text-sm transition ${method === key ? 'border-cb-accent bg-cb-accent/10 text-cb-accent' : 'border-cb-border text-cb-secondary hover:border-cb-accent/50'}`}>
                <span className="block font-bold">{label}</span>
                <span className="text-xs text-cb-secondary">{key === 'Card' ? 'Fastest confirmation' : 'Confirmation recorded instantly for demo'}</span>
              </button>
            ))}
          </div>

          {error && <p className="mt-4 rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
          <button
            onClick={pay}
            disabled={processing}
            className={`mt-5 w-full ${processing ? 'pay-shimmer btn-primary opacity-80' : 'btn-primary'}`}
          >
            {processing ? `Processing R${booking.total}` : `Pay R${booking.total}`}
          </button>
          <p className="mt-3 text-center text-xs text-cb-secondary">A ticket confirmation email is sent after payment.</p>
        </aside>
      </section>
    </main>
  );
}
