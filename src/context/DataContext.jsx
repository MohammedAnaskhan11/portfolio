import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import defaultData from '../data/defaultData';
import { supabase, isSupabaseReady } from '../lib/supabase';

const STORAGE_KEY = 'mak_portfolio_data';
const DataContext  = createContext(null);

// ── helpers ────────────────────────────────────────────────────────
function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] !== null &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      result[key] = { ...base[key], ...override[key] };
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

// Smart merge: for arrays, supplement Supabase data with new defaultData items (by id)
function smartArrayMerge(base, override) {
  const result = deepMerge(base, override);
  for (const key of Object.keys(base)) {
    if (Array.isArray(base[key]) && Array.isArray(override[key])) {
      const existingIds = new Set(override[key].map(item => item?.id).filter(Boolean));
      const missing = base[key].filter(item => item?.id && !existingIds.has(item.id));
      if (missing.length > 0) result[key] = [...override[key], ...missing];
    }
  }
  return result;
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return smartArrayMerge(defaultData, JSON.parse(raw));
  } catch (_) {}
  return defaultData;
}

function saveToLocal(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

// ── fetch all sections from Supabase → build data object ──────────
async function fetchFromSupabase() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('portfolio_sections')
    .select('key, value');
  if (error || !data || data.length === 0) return null;
  const obj = {};
  for (const row of data) obj[row.key] = row.value;
  return Object.keys(obj).length ? smartArrayMerge(defaultData, obj) : null;
}

// ── upsert one section to Supabase ─────────────────────────────────
async function upsertSection(key, value) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('portfolio_sections')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return !error;
}

// ── seed all sections (first-time setup) ──────────────────────────
async function seedSupabase(data) {
  if (!supabase) return;
  const rows = Object.entries(data).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  await supabase.from('portfolio_sections').upsert(rows, { onConflict: 'key' });
}

// ── Provider ───────────────────────────────────────────────────────
export function DataProvider({ children }) {
  const [data, setData]         = useState(loadFromLocal);
  const [synced, setSynced]     = useState(false);   // true once Supabase responded
  const [online, setOnline]     = useState(isSupabaseReady);
  const [saving, setSaving]     = useState(false);
  const subRef                  = useRef(null);

  // ── initial load from Supabase ──────────────────────────────────
  useEffect(() => {
    if (!isSupabaseReady) { setSynced(true); return; }

    fetchFromSupabase().then((remote) => {
      if (remote) {
        setData(remote);
        saveToLocal(remote);
        setOnline(true);
      } else {
        // No rows yet — seed with current local data
        seedSupabase(data).then(() => setOnline(true));
      }
      setSynced(true);
    }).catch(() => {
      setOnline(false);
      setSynced(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── real-time subscription ──────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    subRef.current = supabase
      .channel('portfolio_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_sections' },
        (payload) => {
          const { key, value } = payload.new || {};
          if (!key || !value) return;
          setData((prev) => {
            const next = { ...prev, [key]: value };
            saveToLocal(next);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subRef.current);
    };
  }, []);

  // ── updateSection — writes to Supabase + localStorage ─────────
  const updateSection = useCallback(async (section, value) => {
    setSaving(true);
    // Optimistic local update
    setData((prev) => {
      const next = { ...prev, [section]: value };
      saveToLocal(next);
      return next;
    });

    if (isSupabaseReady) {
      const ok = await upsertSection(section, value);
      setOnline(ok);
    }
    setSaving(false);
  }, []);

  // ── reset ───────────────────────────────────────────────────────
  const resetToDefaults = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
    if (isSupabaseReady) await seedSupabase(defaultData);
  }, []);

  // ── export JSON ─────────────────────────────────────────────────
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'portfolio-data.json'; a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  // ── import JSON ─────────────────────────────────────────────────
  const importJSON = useCallback(async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const merged = deepMerge(defaultData, parsed);
      setData(merged);
      saveToLocal(merged);
      if (isSupabaseReady) await seedSupabase(merged);
      return true;
    } catch (_) { return false; }
  }, []);

  return (
    <DataContext.Provider value={{
      data,
      updateSection,
      resetToDefaults,
      exportJSON,
      importJSON,
      synced,   // loading state for public portfolio
      online,   // Supabase connectivity
      saving,   // write in progress
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
