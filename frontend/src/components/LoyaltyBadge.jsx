const styles = {
  Standard: 'border-cb-border bg-white/5 text-cb-secondary',
  Silver: 'border-slate-300/40 bg-slate-300/20 text-slate-100',
  Gold: 'border-cb-accent/50 bg-cb-accent/20 text-cb-accent',
  Platinum: 'border-cb-teal/50 bg-cb-teal/20 text-cb-teal'
};

export default function LoyaltyBadge({ status = 'Standard' }) {
  return (
    <span className={`inline-flex rounded-md border px-3 py-1 text-xs font-bold ${styles[status] || styles.Standard}`}>
      {status}
    </span>
  );
}
