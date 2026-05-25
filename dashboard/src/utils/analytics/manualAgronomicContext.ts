import type { AgronomicEvent } from '../../types/agronomy';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CuttingCycleEntry {
  cutting_number?: number;
  cutting_cycle_key?: string;
  pivot_1_cutting_event_id?: string;
  pivot_2_cutting_event_id?: string;
  pivot_1_cut_date?: string;
  pivot_2_cut_date?: string;
  pivot_1_notes?: string;
  pivot_2_notes?: string;
  yield_amount?: number;
  yield_unit?: string;
  yield_unit_label?: string;
  yield_reliability?: string;
  yield_scope?: string;
  yield_event_id?: string;
  per_pivot_distribution_recorded?: boolean;
  usual_pivot_difference_cubes?: string | number;
  is_cleaning_cut?: boolean;
  is_official_reference?: boolean;
  notes?: string;
}

export interface FertilizationEntry {
  fertilizer_name?: string;
  fertilizer_type?: string;
  common_name?: string;
  local_name?: string;
  date?: string;
  target_scope?: string;
  amount?: number;
  unit?: string;
  amount_meaning?: string;
  amount_per_pivot?: number;
  unit_per_pivot?: string;
  pivot_1_amount?: number;
  pivot_1_unit?: string;
  pivot_2_amount?: number;
  pivot_2_unit?: string;
  total_amount?: number;
  total_unit?: string;
  quantity_scope?: string;
  quantity_source?: string;
  quantity_confidence?: string;
  quantity_recorded?: boolean;
  notes?: string;
}

export interface ProductionContext {
  completed_cuttings?: number;
  first_cutting_cleaning_cut?: boolean;
  establishment_phase_context?: boolean;
  next_cutting_is_official_reference?: boolean;
  first_official_reliable_cutting?: string;
  per_pivot_distribution_recorded?: boolean;
  usual_pivot_difference_cubes?: string | number;
  notes?: string;
}

export interface IrrigationScheduleContext {
  total_sessions?: number;
  latest_irrigation_start?: string;
  latest_irrigation_end?: string;
  schedule_type?: string;
  pause_window_local?: string;
  pause_window_utc?: string;
  has_pause_resume_schedule?: boolean;
  target_scopes?: string[];
  notes?: string;
}

export interface ManualAgronomicContextSummary {
  season?: {
    start_date?: string;
    end_date?: string;
    season_name?: string;
    basis?: string;
    notes?: string;
  };
  cutting_cycles: CuttingCycleEntry[];
  fertilization: FertilizationEntry[];
  irrigation_schedule_context?: IrrigationScheduleContext;
  production_context?: ProductionContext;
  limitations: string[];
}

// ── Primitive helpers ─────────────────────────────────────────────────────────

function safeDetails(event: AgronomicEvent): Record<string, unknown> {
  try {
    return (event.details ?? {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' && isFinite(v) ? v : undefined;
}

function bool(v: unknown): boolean | undefined {
  return typeof v === 'boolean' ? v : undefined;
}

// Accept "5-6" string ranges or numeric values
function asStringOrNum(v: unknown): string | number | undefined {
  if (typeof v === 'string' && v.length > 0) return v;
  if (typeof v === 'number' && isFinite(v)) return v;
  return undefined;
}

// event.notes column takes priority over details.notes field
function noteOf(event: AgronomicEvent, details: Record<string, unknown>): string | undefined {
  if (event.notes != null && event.notes.length > 0) return event.notes;
  return str(details.notes);
}

function dropUndefined(obj: Record<string, unknown>): void {
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) delete obj[k];
  }
}

const YIELD_UNIT_LABELS: Record<string, string> = {
  alfalfa_cube: 'alfalfa cubes',
  kg: 'kg',
};

// ── Cutting cycle grouping ────────────────────────────────────────────────────

// Note: falls back to individual date keys when cutting_cycle_key and cutting_number
// are both absent. In that case pivot-1 and pivot-2 cuttings (different dates) each
// become separate single-pivot cycles — a known limitation recorded in output.
function getCycleKey(cutting: AgronomicEvent): string {
  const d = safeDetails(cutting);
  return (
    str(d.cutting_cycle_key) ??
    (typeof d.cutting_number === 'number' ? `cycle_num:${d.cutting_number}` : undefined) ??
    `date:${cutting.started_at ?? cutting.agro_event_id}`
  );
}

// Determine which pivot slot a cutting belongs to.
// When scope/pivot_number is ambiguous, fill p1 first then p2 by arrival order.
function getPivotSlot(
  event: AgronomicEvent,
  group: { pivot1?: AgronomicEvent; pivot2?: AgronomicEvent },
): 1 | 2 {
  const scope = event.target_scope as string;
  if (scope === 'pivot_2') return 2;
  const d = safeDetails(event);
  if (d.pivot_number === 2 || d.pivot_number === '2') return 2;
  if (scope === 'pivot_1') return 1;
  if (d.pivot_number === 1 || d.pivot_number === '1') return 1;
  // Default: p1 before p2
  return group.pivot1 ? 2 : 1;
}

function buildCuttingCycles(
  cuttingEvents: AgronomicEvent[],
  yieldByField: Map<string, AgronomicEvent>,
  linkedYieldIds: Set<string>,
): CuttingCycleEntry[] {
  interface CycleGroup { key: string; pivot1?: AgronomicEvent; pivot2?: AgronomicEvent }
  const groupMap = new Map<string, CycleGroup>();

  for (const cutting of cuttingEvents) {
    const key = getCycleKey(cutting);
    let g = groupMap.get(key);
    if (!g) { g = { key }; groupMap.set(key, g); }
    const slot = getPivotSlot(cutting, g);
    // Keep the earlier date when a slot is contested
    if (slot === 2) {
      if (!g.pivot2 || (cutting.started_at ?? '') < (g.pivot2.started_at ?? '')) g.pivot2 = cutting;
    } else {
      if (!g.pivot1 || (cutting.started_at ?? '') < (g.pivot1.started_at ?? '')) g.pivot1 = cutting;
    }
  }

  const entries: CuttingCycleEntry[] = [];

  for (const g of groupMap.values()) {
    const p1 = g.pivot1;
    const p2 = g.pivot2;
    const p1d = p1 ? safeDetails(p1) : {};
    const p2d = p2 ? safeDetails(p2) : {};

    // Build unique lookup keys: both pivot event IDs + cycle key
    const seenKeys = new Set<string>();
    const lookupKeys: string[] = [];
    for (const k of [
      p1?.agro_event_id,
      p2?.agro_event_id,
      str(p1d.cutting_cycle_key) ?? str(p2d.cutting_cycle_key),
    ]) {
      if (k && !seenKeys.has(k)) { seenKeys.add(k); lookupKeys.push(k); }
    }

    let linkedYield: AgronomicEvent | undefined;
    for (const k of lookupKeys) {
      linkedYield = yieldByField.get(k);
      if (linkedYield) break;
    }
    const yd = linkedYield ? safeDetails(linkedYield) : undefined;
    if (linkedYield) linkedYieldIds.add(linkedYield.agro_event_id);

    const cycleKey = str(p1d.cutting_cycle_key) ?? str(p2d.cutting_cycle_key);
    const cuttingNumber = num(p1d.cutting_number) ?? num(p2d.cutting_number);
    const isCleaningCut = bool(p1d.is_cleaning_cut) ?? bool(p2d.is_cleaning_cut);
    const isOfficialRef = bool(p1d.is_official_reference) ?? bool(p2d.is_official_reference);
    const cycleNotes = (p1 ? noteOf(p1, p1d) : undefined) ?? (p2 ? noteOf(p2, p2d) : undefined);

    const yieldUnit = yd ? str(yd.yield_unit) : undefined;

    const entry: CuttingCycleEntry = {
      cutting_number: cuttingNumber,
      cutting_cycle_key: cycleKey,
      pivot_1_cutting_event_id: p1?.agro_event_id,
      pivot_2_cutting_event_id: p2?.agro_event_id,
      pivot_1_cut_date: p1?.started_at,
      pivot_2_cut_date: p2?.started_at,
      pivot_1_notes: p1 ? noteOf(p1, p1d) : undefined,
      pivot_2_notes: p2 ? noteOf(p2, p2d) : undefined,
      yield_amount: yd ? num(yd.yield_amount) : undefined,
      yield_unit: yieldUnit,
      yield_unit_label: yieldUnit ? (YIELD_UNIT_LABELS[yieldUnit] ?? yieldUnit) : undefined,
      yield_reliability: yd ? str(yd.yield_reliability) : undefined,
      yield_scope: linkedYield ? (linkedYield.target_scope as string) : undefined,
      yield_event_id: linkedYield?.agro_event_id,
      per_pivot_distribution_recorded: yd ? bool(yd.per_pivot_distribution_recorded) : undefined,
      usual_pivot_difference_cubes: yd ? asStringOrNum(yd.usual_pivot_difference_cubes) : undefined,
      is_cleaning_cut: isCleaningCut,
      is_official_reference: isOfficialRef,
      notes: cycleNotes,
    };

    dropUndefined(entry as unknown as Record<string, unknown>);
    entries.push(entry);
  }

  entries.sort((a, b) =>
    (a.pivot_1_cut_date ?? a.pivot_2_cut_date ?? '').localeCompare(
      b.pivot_1_cut_date ?? b.pivot_2_cut_date ?? '',
    ),
  );
  return entries;
}

// ── Production context from field_note / yield_context events ─────────────────

function buildProductionContext(
  fieldNotes: AgronomicEvent[],
  completedCuttings: number,
): ProductionContext | undefined {
  const yieldCtxNote = fieldNotes.find(
    (e) => str(safeDetails(e).note_type) === 'yield_context',
  );
  if (!yieldCtxNote && completedCuttings === 0) return undefined;

  const d = yieldCtxNote ? safeDetails(yieldCtxNote) : {};

  // next_cutting_is_official_reference is data-driven only — never inferred
  let nextRef: boolean | undefined;
  if (d.first_official_reliable_cutting === 'next_cutting' || d.next_cutting_is_official_reference === true) {
    nextRef = true;
  } else if (d.next_cutting_is_official_reference === false) {
    nextRef = false;
  }

  const ctx: ProductionContext = {
    completed_cuttings: completedCuttings > 0 ? completedCuttings : undefined,
    first_cutting_cleaning_cut: bool(d.first_cutting_cleaning_cut),
    establishment_phase_context: bool(d.establishment_phase_context),
    next_cutting_is_official_reference: nextRef,
    first_official_reliable_cutting: str(d.first_official_reliable_cutting),
    per_pivot_distribution_recorded: bool(d.per_pivot_distribution_recorded),
    usual_pivot_difference_cubes: asStringOrNum(d.usual_pivot_difference_cubes),
    notes: yieldCtxNote ? noteOf(yieldCtxNote, d) : undefined,
  };

  dropUndefined(ctx as unknown as Record<string, unknown>);
  return Object.keys(ctx).length > 0 ? ctx : undefined;
}

// ── Fertilization ─────────────────────────────────────────────────────────────

function buildFertilizationEntries(fertEvents: AgronomicEvent[]): FertilizationEntry[] {
  return fertEvents.map((fert) => {
    const fd = safeDetails(fert);
    const entry: FertilizationEntry = {
      fertilizer_name: str(fd.fertilizer_name),
      fertilizer_type: str(fd.fertilizer_type),
      common_name: str(fd.common_name),
      local_name: str(fd.local_name),
      date: fert.started_at,
      target_scope: fert.target_scope as string,
      amount: num(fd.amount),
      unit: str(fd.unit),
      amount_meaning: str(fd.amount_meaning),
      amount_per_pivot: num(fd.amount_per_pivot),
      unit_per_pivot: str(fd.unit_per_pivot),
      pivot_1_amount: num(fd.pivot_1_amount),
      pivot_1_unit: str(fd.pivot_1_unit),
      pivot_2_amount: num(fd.pivot_2_amount),
      pivot_2_unit: str(fd.pivot_2_unit),
      total_amount: num(fd.total_amount),
      total_unit: str(fd.total_unit),
      quantity_scope: str(fd.quantity_scope),
      quantity_source: str(fd.quantity_source),
      quantity_confidence: str(fd.quantity_confidence),
      quantity_recorded: bool(fd.quantity_recorded),
      notes: noteOf(fert, fd),
    };
    dropUndefined(entry as unknown as Record<string, unknown>);
    return entry;
  });
}

// ── Irrigation schedule context ───────────────────────────────────────────────

function buildIrrigationScheduleContext(
  irrigationEvents: AgronomicEvent[],
): IrrigationScheduleContext | undefined {
  if (!irrigationEvents.length) return undefined;

  const sorted = [...irrigationEvents].sort(
    (a, b) => (b.started_at ?? '').localeCompare(a.started_at ?? ''),
  );
  const latest = sorted[0];
  const latestD = safeDetails(latest);

  const scopes = [...new Set(irrigationEvents.map((e) => e.target_scope as string).filter(Boolean))];

  let scheduleType: string | undefined;
  let pauseWindowLocal: string | undefined;
  let pauseWindowUtc: string | undefined;
  let hasPauseResume = false;

  for (const ev of sorted) {
    const d = safeDetails(ev);
    if (!scheduleType) scheduleType = str(d.schedule) ?? str(d.schedule_type);
    if (!pauseWindowLocal) pauseWindowLocal = str(d.pause_window_local) ?? str(d.pause_window);
    if (!pauseWindowUtc) pauseWindowUtc = str(d.pause_window_utc);
    if (d.pause_window_local != null || d.pause_window != null || d.pause_window_utc != null) {
      hasPauseResume = true;
    }
  }

  const ctx: IrrigationScheduleContext = {
    total_sessions: irrigationEvents.length,
    latest_irrigation_start: latest.started_at,
    latest_irrigation_end: latest.ended_at ?? undefined,
    schedule_type: scheduleType,
    pause_window_local: pauseWindowLocal,
    pause_window_utc: pauseWindowUtc,
    has_pause_resume_schedule: hasPauseResume ? true : undefined,
    target_scopes: scopes.length ? scopes : undefined,
    notes: noteOf(latest, latestD),
  };

  dropUndefined(ctx as unknown as Record<string, unknown>);
  return ctx;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildManualAgronomicContext(events: AgronomicEvent[]): ManualAgronomicContextSummary {
  const limitations: string[] = [];

  // Season
  const seasonStart = events.find((e) => e.event_type === 'season_start');
  const seasonEnd = events.find((e) => e.event_type === 'season_end');
  const seasonStartD = seasonStart ? safeDetails(seasonStart) : {};
  let season: ManualAgronomicContextSummary['season'];
  if (seasonStart || seasonEnd) {
    season = {
      start_date: seasonStart?.started_at,
      end_date: seasonEnd?.started_at,
      season_name: str(seasonStartD.season_name),
      basis: str(seasonStartD.basis),
      notes: seasonStart ? noteOf(seasonStart, seasonStartD) : undefined,
    };
    dropUndefined(season as unknown as Record<string, unknown>);
  }

  const cuttingEvents = events.filter((e) => e.event_type === 'cutting_event');
  const yieldEvents = events.filter((e) => e.event_type === 'yield_record');
  const fieldNotes = events.filter((e) => e.event_type === 'field_note');
  const fertEvents = events.filter((e) => e.event_type === 'fertilization_event');
  const irrigationEvents = events.filter((e) => e.event_type === 'irrigation_session');

  // Build yield lookup map keyed by all possible linking fields
  const yieldByField = new Map<string, AgronomicEvent>();
  for (const y of yieldEvents) {
    const yd = safeDetails(y);
    for (const id of [
      str(yd.cutting_event_id),
      str(yd.cutting_cycle_key),
      str(yd.pivot_1_cutting_event_id),
      str(yd.pivot_2_cutting_event_id),
    ].filter((id): id is string => id !== undefined)) {
      if (!yieldByField.has(id)) yieldByField.set(id, y);
    }
  }

  const linkedYieldIds = new Set<string>();
  const cutting_cycles = buildCuttingCycles(cuttingEvents, yieldByField, linkedYieldIds);

  const unlinked = yieldEvents.filter((y) => !linkedYieldIds.has(y.agro_event_id));
  if (unlinked.length) {
    limitations.push(`${unlinked.length} yield record(s) could not be linked to a cutting event.`);
  }

  const fertilization = buildFertilizationEntries(fertEvents);
  const irrigation_schedule_context = buildIrrigationScheduleContext(irrigationEvents);
  const production_context = buildProductionContext(fieldNotes, cutting_cycles.length);

  if (!cuttingEvents.length) limitations.push('No cutting events found — cutting cycle context unavailable.');
  if (!fertEvents.length) limitations.push('No fertilization events found — fertilization context unavailable.');
  if (!seasonStart) limitations.push('No season_start event found — productive season start date unavailable.');

  return { season, cutting_cycles, fertilization, irrigation_schedule_context, production_context, limitations };
}
