// lib/errorCodes.js

/**
 * Maps Postgres/PostgREST error codes to clean API error objects.
 * Used by errorHandler.js to translate DB errors into client-safe responses.
 */
export const POSTGRES_ERROR_MAP = {
  // Postgres error codes
  '23505': { code: 'DUPLICATE_ENTRY',    message: 'A record with this value already exists.',     status: 409 },
  '23503': { code: 'INVALID_REFERENCE',  message: 'Referenced record does not exist.',            status: 400 },
  '23514': { code: 'INVALID_VALUE',      message: 'Value violates a database constraint.',        status: 400 },
  '23502': { code: 'MISSING_FIELD',      message: 'A required field is missing.',                 status: 400 },
  '42501': { code: 'FORBIDDEN',          message: 'You do not have permission for this action.',  status: 403 },

  // PostgREST error codes
  'PGRST116': { code: 'NOT_FOUND',       message: 'The requested record does not exist.',         status: 404 },
  'PGRST204': { code: 'NOT_FOUND',       message: 'No rows matched the query.',                   status: 404 },
}