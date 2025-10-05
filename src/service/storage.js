const KEY = "med_data_v1";

export function loadData() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { medicines: [], doses: [] };
  try { return JSON.parse(raw); } catch { return { medicines: [], doses: [] }; }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
