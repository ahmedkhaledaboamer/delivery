import { store } from "@/store";

/**
 * Formatting helpers. They follow the app language (settings.language) on every call, so no signature changes
 * are needed for Arabic. Digits stay Western (0-9) in both languages to match prices across the app.
 */

const isArabic = () => store.getState().settings.language === "ar";

const fmtAmount = (amount: number) => (Number.isInteger(amount) ? String(amount) : amount.toFixed(2));

/** "AED 12" / "12 درهم" */
export const formatAED = (amount: number) => (isArabic() ? `${fmtAmount(amount)} درهم` : `AED ${fmtAmount(amount)}`);

/** "+AED 12.00" / "+12.00 درهم" */
export const formatSignedAED = (amount: number) => {
  const sign = amount < 0 ? "-" : "+";
  const value = Math.abs(amount).toFixed(2);
  return isArabic() ? `${sign}${value} درهم` : `${sign}AED ${value}`;
};

/** "14:05" (24-hour, same in both languages). */
export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
/** Gulf-style Arabic month names (used for both short and long forms). */
const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

/** "3 Nov 2026" / "3 نوفمبر 2026" */
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  const month = isArabic() ? MONTHS_AR[d.getMonth()] : MONTHS[d.getMonth()];
  return `${d.getDate()} ${month} ${d.getFullYear()}`;
};

/** "Today, 3 November 2026" / "Yesterday, ..." / "3 November 2026" (Arabic: "اليوم، 3 نوفمبر 2026") */
export const formatDayLabel = (iso: string) => {
  const ar = isArabic();
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  const base = `${d.getDate()} ${(ar ? MONTHS_AR : MONTHS_LONG)[d.getMonth()]} ${d.getFullYear()}`;
  if (d.toDateString() === today.toDateString()) return ar ? `اليوم، ${base}` : `Today, ${base}`;
  if (d.toDateString() === yesterday.toDateString()) return ar ? `أمس، ${base}` : `Yesterday, ${base}`;
  return base;
};

/** Arabic count + noun with the right plural form: 1 دقيقة, 2 دقيقتين, 3–10 دقائق, 11+ دقيقة. */
const arCount = (n: number, one: string, two: string, few: string) => {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${one}`;
};

/** "2 min ago", "3 h ago", "Yesterday" / "منذ دقيقتين", "منذ 3 ساعات", "أمس" */
export const formatRelative = (iso: string) => {
  const ar = isArabic();
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return ar ? "الآن" : "Just now";
  if (min < 60) return ar ? `منذ ${arCount(min, "دقيقة", "دقيقتين", "دقائق")}` : `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return ar ? `منذ ${arCount(h, "ساعة", "ساعتين", "ساعات")}` : `${h} h ago`;
  if (h < 48) return ar ? "أمس" : "Yesterday";
  return formatDate(iso);
};

/** Masks a phone for display: "+971 50 123 4567" -> "+971 ** *** 4567" (show it inside an LTR wrapper). */
export const maskPhone = (phone: string) => {
  const digits = phone.replace(/\s/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)} ** *** ${digits.slice(-3)}`;
};
