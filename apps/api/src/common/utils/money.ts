export interface PaymentSplit {
  commission: number;
  payout: number;
}

/**
 * Splits a customer payment into platform commission + owner payout.
 * Rounding is intentional: the platform takes the rounded percentage and the
 * owner gets the rest, so the two amounts sum exactly to `totalAmount`.
 */
export function computeSplit(totalAmount: number, commissionPercent: number): PaymentSplit {
  const safePercent = Math.max(0, Math.min(100, commissionPercent));
  const commission = Math.round((totalAmount * safePercent) / 100);
  return { commission, payout: totalAmount - commission };
}

/**
 * Normalizes a Kenyan mobile number to Safaricom's `254XXXXXXXXX` form.
 * Returns null when the input can't be unambiguously interpreted as a Kenyan
 * mobile number — callers should treat null as a validation failure.
 */
export function normalizeKenyanPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('254')) return digits;
  if (digits.length === 10 && digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
    return `254${digits}`;
  }
  return null;
}
