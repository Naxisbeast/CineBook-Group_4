export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-cb-border bg-[#101014]">
      <div className="shimmer aspect-[2/3]" />
      <div className="space-y-2 p-3">
        <div className="shimmer h-3 w-4/5 rounded" />
        <div className="shimmer h-2 w-2/5 rounded" />
      </div>
    </div>
  );
}
