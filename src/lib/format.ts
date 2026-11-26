export const formatAED = (amount: number) => `AED ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;

export const formatSignedAED = (amount: number) => `${amount < 0 ? "-" : "+"}AED ${Math.abs(amount).toFixed(2)}`;

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "3 Nov 2026" */
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "Today, 3 November 2026" / "Yesterday, ..." / "3 November 2026" */
export const formatDayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  const base = `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
  if (d.toDateString() === today.toDateString()) return `Today, ${base}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${base}`;
  return base;
};

/** "2 min ago", "3 h ago", "Yesterday" */
export const formatRelative = (iso: string) => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  if (h < 48) return "Yesterday";
  return formatDate(iso);
};

/** Masks a phone for display: "+971 50 123 4567" -> "+971 ** *** 4567" */
export const maskPhone = (phone: string) => {
  const digits = phone.replace(/\s/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)} ** *** ${digits.slice(-3)}`;
};
