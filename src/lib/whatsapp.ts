export function buildWhatsAppUrl(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `54${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
