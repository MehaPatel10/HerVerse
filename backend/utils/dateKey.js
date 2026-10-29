// YYYY-MM-DD for a date, using the server's local calendar day.
function dateKeyFor(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Today plus the previous (days - 1) days, oldest first.
function lastNDayKeys(days) {
  const keys = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(dateKeyFor(d));
  }
  return keys;
}

module.exports = { dateKeyFor, lastNDayKeys };
