export function InfoPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
      <div className="prose-sm mt-6 space-y-4 text-sm leading-relaxed text-zinc-600">
        {children}
      </div>
    </div>
  );
}