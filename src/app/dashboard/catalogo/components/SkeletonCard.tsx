// src/app/dashboard/catalogo/components/SkeletonCard.tsx

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="w-full bg-gray-100" style={{ height: '120px' }} />
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1.5">
        <div className="h-2.5 w-8 bg-gray-200 rounded-full" />
        <div className="h-3 w-full bg-gray-200 rounded-full" />
        <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
        <div className="h-4 w-14 bg-gray-200 rounded-full mt-0.5" />
        <div className="h-10 w-full bg-gray-200 rounded-xl mt-0.5" />
      </div>
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div
      className="px-3 pt-3 pb-28 md:pb-8"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
