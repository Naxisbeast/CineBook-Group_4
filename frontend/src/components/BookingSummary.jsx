export default function BookingSummary({ movie, show, selected, total, onConfirm, submitting = false }) {
  const seatCount = selected.length;

  return (
    <aside className="sticky top-24 rounded-lg border border-cb-border bg-[#101014]/96 p-4 shadow-2xl backdrop-blur lg:p-5">
      <p className="eyebrow">Checkout</p>
      <h3 className="section-title mt-2 text-4xl">Order Summary</h3>
      <p className="mt-2 text-sm font-bold">{movie?.Title}</p>
      <p className="text-xs text-cb-secondary">{show?.Theatre_Name} - {show?.City}</p>

      <div className="my-4 h-px bg-cb-border" />

      <div className="max-h-52 space-y-2 overflow-auto pr-1">
        {selected.length ? selected.map((seat) => (
          <div key={seat.Seat_Id} className="flex items-center justify-between rounded-md border border-cb-border bg-black/25 p-2 text-xs">
            <span>{seat.Row_Label}{seat.Seat_Number} - {seat.Seat_Type}</span>
            <span className="mono-font text-cb-accent">R{seat.price}</span>
          </div>
        )) : <p className="rounded-md border border-dashed border-cb-border p-4 text-sm text-cb-secondary">Select seats to build your order.</p>}
      </div>

      <div className="mt-5 rounded-lg border border-cb-border bg-black/24 p-3">
        <div className="flex items-center justify-between text-sm text-cb-secondary">
          <span>{seatCount} seats selected</span>
          <span className="mono-font">R{total}</span>
        </div>
        <p className="mono-font mt-2 text-4xl text-cb-accent">R{total}</p>
      </div>

      <button
        type="button"
        disabled={!seatCount || submitting}
        onClick={onConfirm}
        className={`mt-4 w-full ${seatCount && !submitting ? 'btn-primary' : 'btn-secondary opacity-60'}`}
      >
        {submitting ? 'Creating Booking...' : 'Continue To Payment'}
      </button>
    </aside>
  );
}
