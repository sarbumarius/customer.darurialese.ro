// src/utils/validation.ts

// Helper to validate Romanian phone numbers
// Accepts formats:
//  - +40[2|3|7]xxxxxxxx (total 12 chars with +)
//  - 0040[2|3|7]xxxxxxxx
//  - 0[2|3|7]xxxxxxxx (domestic format, 10 digits)
// Ignores spaces, dashes, and parentheses.
export const isRomanianPhoneNumber = (input: string | null | undefined): boolean => {
  if (!input) return false;
  try {
    // Remove spaces, dashes, dots, and parentheses
    let s = String(input).trim().replace(/[\s\-().]/g, "");
    // Normalize 0040 to +40
    if (s.startsWith("0040")) s = "+" + s.slice(2);
    // If starts with +, keep it only for +40
    if (s.startsWith("+")) {
      // Only accept +40 followed by 9 digits, starting with 2/3/7
      return /^\+40[237]\d{8}$/.test(s);
    }
    // Domestic format: 0[2/3/7] and 8 more digits
    return /^0[237]\d{8}$/.test(s);
  } catch {
    return false;
  }
};

// Helper: loose email validation for UI hints
// Marks invalid when missing '@' or having a clearly wrong TLD like '.con'.
// We keep it permissive to avoid false negatives, but enough to flag common typos.
export const isLikelyValidEmail = (input: string | null | undefined): boolean => {
  try {
    const s = String(input || '').trim();
    if (!s) return false; // empty treated as invalid for our display logic
    if (s.includes(' ')) return false;
    if (!s.includes('@')) return false;
    // basic shape: something@something.tld (tld at least 2)
    const basic = /.+@.+\.[A-Za-z]{2,}$/;
    if (!basic.test(s)) return false;
    // explicitly reject common typo '.con' ending
    if (/\.con$/i.test(s)) return false;
    return true;
  } catch {
    return false;
  }
};
