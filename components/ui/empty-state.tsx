import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <SearchX className="h-6 w-6 text-zinc-400" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}