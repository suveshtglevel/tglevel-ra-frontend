// Time helpers shared between the 12-hour UI (pickers, preview) and the API,
// which expects 24-hour "HH:MM".

// "10:00 AM" / "9:30 PM" -> "HH:MM" (24-hour). Returns '' if unparseable.
// Already-24h "HH:MM" strings pass through unchanged.
export function to24Hour(value: string): string {
  const v = value.trim();
  const ampm = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${ampm[2]}`;
  }
  const h24 = v.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) return `${h24[1].padStart(2, '0')}:${h24[2]}`;
  return '';
}

// "HH:MM" (24-hour) -> "h:mm AM/PM". Returns '' if unparseable.
export function to12Hour(value: string): string {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return '';
  let h = parseInt(m[1], 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 === 0 ? 12 : h % 12;
  return `${h}:${m[2]} ${period}`;
}
