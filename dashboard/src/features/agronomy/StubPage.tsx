export function StubPage({ title }: { title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">Foundation route is present. Write flows and agronomic forms are pending.</p>
    </section>
  );
}

