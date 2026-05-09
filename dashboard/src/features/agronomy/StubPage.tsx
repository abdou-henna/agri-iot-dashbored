export function StubPage({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">Foundation route is present. Write flows and agronomic forms are pending.</p>
    </section>
  );
}

