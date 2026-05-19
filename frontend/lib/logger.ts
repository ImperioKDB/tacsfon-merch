/**
 * lib/logger.ts
 *
 * Structured JSON logger for the frontend (Next.js App Router / server side).
 * Output format matches the backend's structured log lines so both ends
 * are parseable by the same log aggregator.
 *
 * Client components: avoid importing this directly — it uses console methods
 * that are fine on the server but noisy in the browser. Wrap in a server
 * action or API route instead.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMeta {
  [key: string]: unknown
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  })

  switch (level) {
    case 'error': console.error(entry); break
    case 'warn':  console.warn(entry);  break
    case 'debug': console.debug(entry); break
    default:      console.log(entry);   break
  }
}

export const logger = {
  info:  (message: string, meta?: LogMeta) => write('info',  message, meta),
  warn:  (message: string, meta?: LogMeta) => write('warn',  message, meta),
  error: (message: string, meta?: LogMeta) => write('error', message, meta),
  debug: (message: string, meta?: LogMeta) => write('debug', message, meta),
}

/** Convenience default export for quick one-liner usage */
export default logger