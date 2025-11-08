/**
 * Utilities for sanitizing and redacting sensitive data
 */

const SENSITIVE_FIELD_PATTERNS = [
  /apikey/i,
  /api_key/i,
  /password/i,
  /secret/i,
  /token/i,
  /credential/i,
  /auth/i,
]

/**
 * Redact sensitive fields from an object
 */
export function redactSensitiveFields(obj: any, patterns = SENSITIVE_FIELD_PATTERNS): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveFields(item, patterns))
  }

  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = patterns.some((pattern) => pattern.test(key))

    if (isSensitive) {
      result[key] = '[REDACTED]'
    } else if (typeof value === 'object') {
      result[key] = redactSensitiveFields(value, patterns)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Sanitize error for logging
 */
export function sanitizeError(error: Error): Record<string, any> {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack?.split('\n').slice(0, 3).join('\n'), // Only first 3 lines
  }
}
