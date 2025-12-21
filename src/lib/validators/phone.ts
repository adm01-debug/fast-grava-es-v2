export function isValidPhone(phone: string): boolean {
  return /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(phone);
}
