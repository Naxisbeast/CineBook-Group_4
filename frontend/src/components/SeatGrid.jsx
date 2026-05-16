import { useMemo } from 'react';

const statusClasses = {
  available: 'bg-[var(--seat-available)] text-emerald-50 hover:border-emerald-300/60 hover:brightness-125',
  booked: 'bg-[var(--seat-booked)] text-red-100 opacity-55 cursor-not-allowed',
  selected: 'bg-[var(--seat-selected)] text-black seat-pop border-cb-accent shadow-[0_0_22px_rgba(244,197,66,0.24)]'
};

export default function SeatGrid({ seats, selected, onToggle }) {
  const grouped = useMemo(
    () =>
      seats.reduce((acc, seat) => {
        if (!acc[seat.Row_Label]) acc[seat.Row_Label] = [];
        acc[seat.Row_Label].push(seat);
        return acc;
      }, {}),
    [seats]
  );

  const rows = Object.entries(grouped);

  return (
    <div className="seat-stage overflow-x-auto rounded-lg border border-cb-border bg-[#0b0b0e] p-4 shadow-2xl md:p-8">
      <div className="mx-auto mb-10 w-fit text-center">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.34em] text-cb-secondary">Screen</div>
        <div className="screen-shape" />
      </div>

      <div className="seat-rows mx-auto min-w-[700px] space-y-3">
        {rows.map(([row, rowSeats], idx) => (
          <div key={row} className="flex items-center gap-2" style={{ transform: `translateX(${Math.abs(2 - idx) * 10}px)` }}>
            <div className="mono-font w-7 text-center text-xs text-cb-secondary">{row}</div>
            <div className="grid flex-1 grid-cols-10 gap-2">
              {rowSeats.map((seat) => {
                const seatCode = `${seat.Row_Label}${seat.Seat_Number}`;
                const isSelected = selected.some((item) => item.Seat_Id === seat.Seat_Id);
                const status = seat.status === 'booked' ? 'booked' : isSelected ? 'selected' : 'available';
                const isPremium = seat.Seat_Type === 'Premium';
                const isVip = seat.Seat_Type === 'VIP';
                return (
                  <button
                    key={seat.Seat_Id}
                    type="button"
                    disabled={seat.status === 'booked'}
                    onClick={() => onToggle(seat)}
                    aria-label={`${seatCode} ${seat.Seat_Type} ${status}`}
                    aria-pressed={isSelected}
                    className={`mono-font h-9 rounded-md border text-[11px] font-bold transition ${statusClasses[status]} ${isPremium ? 'border-cb-accent/70' : 'border-white/10'} ${isVip ? 'border-cb-teal/80 text-xs' : ''}`}
                    title={`${seatCode} - ${seat.Seat_Type}`}
                  >
                    {seat.Seat_Number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
