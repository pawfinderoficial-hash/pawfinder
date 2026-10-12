export function buildWhatsAppUrl(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `549${digits}`;
  if (digits.startsWith("54") && !digits.startsWith("549") && digits.length === 12) {
    digits = `549${digits.slice(2)}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
