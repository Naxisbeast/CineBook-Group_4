import { Link } from 'react-router-dom';

export default function ShowCard({ show }) {
  const soldOut = Boolean(Number(show.Sold_Out)) || Number(show.Seats_Remaining) <= 0;
  const screenClasses = {
    Standard: 'border-cb-border text-cb-secondary',
    Premium: 'border-cb-accent text-cb-accent',
    VIP: 'border-cb-teal text-cb-teal'
  };

  return (
    <article className={`min-w-[270px] rounded-lg border p-4 transition ${soldOut ? 'border-cb-border/50 bg-cb-elevated/40 opacity-60' : 'border-cb-border bg-[#101014] hover:border-cb-accent/60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono-font text-3xl text-cb-accent">{new Date(show.Show_DateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="mt-2 text-sm font-bold">{show.Theatre_Name}</p>
          <p className="text-xs text-cb-secondary">{show.City}</p>
        </div>
        <span className={`rounded-md border px-2 py-1 text-xs font-bold ${screenClasses[show.Screen_Type] || 'border-cb-border'}`}>{show.Screen_Type}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-cb-secondary">
        <span>{Number(show.Seats_Remaining || 0)} seats left</span>
        <span className="mono-font text-cb-text">R{show.Price_Per_Seat}</span>
      </div>
      {soldOut ? (
        <p className="mt-4 rounded-md border border-cb-border bg-cb-elevated px-4 py-3 text-center text-sm text-cb-secondary">Sold Out</p>
      ) : (
        <Link to={`/booking/${show.Show_Id}`} className="btn-primary mt-4 w-full text-sm">Select Seats</Link>
      )}
    </article>
  );
}
