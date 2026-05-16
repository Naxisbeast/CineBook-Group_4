import { Link } from 'react-router-dom';

function emailMessage(booking) {
  if (booking.email_message) return booking.email_message;
  if (!booking.email_status) return null;
  if (booking.email_sent) return 'Ticket email sent to your account email.';
  if (booking.email_status === 'preview') {
    return 'Email preview was printed in the backend console. Configure SMTP to send real emails.';
  }
  if (booking.email_status === 'blocked_ip') {
    return 'Brevo blocked this machine IP address. Authorize the IP in Brevo or disable IP restrictions.';
  }
  if (booking.email_status === 'smtp_greeting_timeout') {
    return 'SMTP connected but timed out waiting for Brevo. Try Brevo port 2525 or 465.';
  }
  return 'Ticket email could not be sent, but your booking is confirmed.';
}

export default function BookingConfirmation({ booking }) {
  const emailNotice = emailMessage(booking);

  return (
    <section className="page-enter flex min-h-screen items-center justify-center px-4 py-28">
      <div className="cinema-panel w-full max-w-2xl overflow-hidden text-center">
        <div className="bg-[linear-gradient(180deg,rgba(244,197,66,0.13),rgba(5,5,6,0))] p-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-cb-accent/40 bg-cb-accent/10">
            <svg width="58" height="58" viewBox="0 0 120 120" aria-hidden="true">
              <path className="checkmark-path" d="M35 62 L52 79 L85 45" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="eyebrow mt-6">Payment Complete</p>
          <h1 className="section-title mt-2 text-6xl">Booking Confirmed</h1>
          <p className="mono-font mt-2 text-xl text-cb-accent">{booking.reference}</p>
        </div>

        <div className="px-6 pb-8 md:px-8">
          <div className="grid gap-3 rounded-lg border border-cb-border bg-black/24 p-4 text-sm text-cb-secondary md:grid-cols-2">
            <p className="font-bold text-cb-text md:col-span-2">{booking.movie.Title}</p>
            <p>{new Date(booking.show.Show_DateTime).toLocaleString()}</p>
            <p>{booking.show.Theatre_Name} - {booking.show.City}</p>
            <p>Seats: {booking.seats.map((seat) => `${seat.Row_Label}${seat.Seat_Number}`).join(', ')}</p>
            <p className="mono-font text-cb-accent">R{booking.total}</p>
          </div>

          {emailNotice && (
            <p className="mt-4 rounded-lg border border-cb-border bg-cb-elevated p-3 text-sm text-cb-secondary">
              {emailNotice}
            </p>
          )}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/profile" className="btn-secondary">View My Tickets</Link>
            <Link to="/" className="btn-primary">Back to Movies</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
