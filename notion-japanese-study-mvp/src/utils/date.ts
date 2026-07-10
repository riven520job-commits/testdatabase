export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(days: number, date = new Date()): string {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return todayKey(copy);
}

export function isDue(date?: string): boolean {
  if (!date) {
    return true;
  }
  return date <= todayKey();
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}
