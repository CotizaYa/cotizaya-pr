// src/app/dashboard/catalogo/components/SkeletonCard.tsx

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="w-full bg-gray-100" style={{ aspectRatio: '4 / 3' }} />
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="h-3 w-10 bg-gray-200 rounded-full" />
        <div className="h-3.5 w-full bg-gray-200 rounded-full" />
        <div className="h-3.5 w-2/3 bg-gray-200 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 rounded-full mt-0.5" />
        <div className="h-11 w-full bg-gray-200 rounded-xl mt-1" />
      </div>
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-3 pt-3 pb-28 md:pb-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
