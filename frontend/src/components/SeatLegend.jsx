export default function SeatLegend() {
  const items = [
    ['Available', 'bg-[var(--seat-available)] border-emerald-300/30'],
    ['Selected', 'bg-[var(--seat-selected)] border-cb-accent text-black'],
    ['Booked', 'bg-[var(--seat-booked)] border-red-300/25'],
    ['Premium', 'bg-cb-surface border-cb-accent text-cb-accent'],
    ['VIP', 'bg-cb-surface border-cb-teal text-cb-teal']
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, styles]) => (
        <div key={label} className={`rounded-md border px-3 py-2 text-xs font-bold ${styles}`}>{label}</div>
      ))}
    </div>
  );
}
