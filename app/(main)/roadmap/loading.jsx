import { BarLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-[300px] rounded-xl border bg-card animate-pulse" />
        <div className="space-y-4">
          <div className="h-[150px] rounded-xl border bg-card animate-pulse" />
          <div className="h-[150px] rounded-xl border bg-card animate-pulse" />
        </div>
      </div>
    </div>
  );
}