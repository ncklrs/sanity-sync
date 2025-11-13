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

/**
 * Sanitize a string for use in GROQ queries
 * Escapes special characters to prevent injection
 */
export function sanitizeGroqString(input: string): string {
  // Escape quotes and backslashes
  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'")
}

/**
 * Validate and sanitize ID pattern for GROQ match operator
 * Only allows safe glob patterns
 */
export function sanitizeIdPattern(pattern: string): string {
  // Remove any quotes or special GROQ operators
  const cleaned = pattern
    .replace(/["'`]/g, '')
    .replace(/[&|()<>]/g, '')
    .trim()

  // Only allow alphanumeric, dash, underscore, dot, and * for glob
  if (!/^[a-zA-Z0-9\-_.*]+$/.test(cleaned)) {
    throw new Error(`Invalid ID pattern: ${pattern}`)
  }

  return cleaned
}

/**
 * Validate dataset name to prevent injection
 */
export function validateDatasetName(dataset: string): boolean {
  // Dataset names must be alphanumeric with optional hyphens/underscores
  return /^[a-zA-Z0-9_-]+$/.test(dataset)
}

/**
 * Validate document type name
 */
export function validateDocumentType(type: string): boolean {
  // Type names must be alphanumeric with optional dots for namespacing
  return /^[a-zA-Z][a-zA-Z0-9.]*$/.test(type)
}

/**
 * Sanitize array of document types for GROQ
 */
export function sanitizeDocumentTypes(types: string[]): string[] {
  return types.filter(validateDocumentType).map(sanitizeGroqString)
}

/**
 * Validate ISO date string
 */
export function validateIsoDate(date: string): boolean {
  const parsed = new Date(date)
  return !isNaN(parsed.getTime()) && date.includes('-') // Ensure date format
}
