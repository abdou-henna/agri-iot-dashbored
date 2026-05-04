import { useState } from 'react';
import { useFieldNotes } from '../../hooks/useAgronomyPhase5';

export function FieldNotesPage() {
  const { data, createNote } = useFieldNotes();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rows = data?.events ?? [];
  return <section className="rounded-lg border border-slate-200 bg-white p-4">
    <h2 className="text-lg font-semibold">Field Notes</h2>
    <textarea className="mt-2 w-full rounded-md border border-slate-300 p-3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write field note..." />
    <button className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-white" onClick={async () => {
      setError(null);
      if (!notes.trim()) return setError('Note text is required.');
      await createNote({ target_scope: 'farm', started_at: new Date().toISOString(), confidence: 'exact', notes: notes.trim() });
      setNotes('');
    }}>Save note</button>
    {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
    <div className="mt-3 space-y-2 text-sm">{rows.length ? rows.map((item) => <div key={item.agro_event_id} className="rounded bg-slate-50 p-2">{item.notes ?? item.agro_event_id}</div>) : 'No field notes yet.'}</div>
  </section>;
}
