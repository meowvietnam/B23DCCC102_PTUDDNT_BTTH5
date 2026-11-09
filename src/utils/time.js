const pad = n => String(n).padStart(2, '0');

export function formatTime(ts) {
  if (!ts) {
    return '';
  }
  const d = new Date(ts);
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return hm;
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${hm}`;
}
