/**
 * Validation messages, exactly as the prototypes word them.
 * Forms validate on submit, not on blur.
 */

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Enter your email address.'
  if (!EMAIL_RE.test(value)) return 'That email doesn’t look right.'
  return null
}

export function validateFullName(value: string): string | null {
  return value.trim() ? null : 'Enter your full name.'
}

export function validatePassword(value: string): string | null {
  return value.length >= 8 ? null : 'Use at least 8 characters.'
}

export function validateTerms(accepted: boolean): string | null {
  return accepted ? null : 'Please accept the terms to continue.'
}
