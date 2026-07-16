import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6" aria-busy="true" aria-label="Carregando dashboard">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="mt-5 h-8 w-full max-w-md" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[126px] rounded-xl" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <Skeleton className="h-[380px] rounded-xl xl:col-span-8" />
        <Skeleton className="h-[380px] rounded-xl xl:col-span-4" />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <Skeleton className="h-[390px] rounded-xl xl:col-span-7" />
        <Skeleton className="h-[390px] rounded-xl xl:col-span-5" />
      </div>

      <Skeleton className="h-[330px] rounded-xl" />
      <span className="sr-only">Carregando dados do dashboard...</span>
    </div>
  );
}
