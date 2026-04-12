/**
 * Runtime validation utilities for Supabase API responses.
 * Uses Zod schemas to validate data at runtime, catching
 * mismatches between DB schema and TypeScript types.
 */

import { z, ZodSchema, ZodError } from 'zod';
import { logger } from '@/lib/logger';

export interface SafeParseResult<T> {
  success: true;
  data: T;
}

export interface SafeParseError {
  success: false;
  error: ZodError;
  rawData: unknown;
}

type ParseResult<T> = SafeParseResult<T> | SafeParseError;

/**
 * Safely parse a single record from a Supabase response.
 * Returns typed data on success, or logs the validation error.
 */
export function safeParse<T>(schema: ZodSchema<T>, data: unknown, context?: string): ParseResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  logger.warn(
    `Validation failed${context ? ` in ${context}` : ''}: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
    { issues: result.error.issues, rawData: data },
    'validation'
  );

  return { success: false, error: result.error, rawData: data };
}

/**
 * Safely parse an array of records, filtering out invalid ones.
 * Returns only valid records with a count of failures.
 */
export function safeParseArray<T>(
  schema: ZodSchema<T>,
  data: unknown[],
  context?: string
): { valid: T[]; invalidCount: number } {
  let invalidCount = 0;
  const valid: T[] = [];

  for (const item of data) {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalidCount++;
    }
  }

  if (invalidCount > 0) {
    logger.warn(
      `${invalidCount} of ${data.length} records failed validation${context ? ` in ${context}` : ''}`,
      undefined,
      'validation'
    );
  }

  return { valid, invalidCount };
}

/**
 * Parse or throw — for cases where invalid data is a critical error.
 */
export function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown, context?: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    logger.error(`Critical validation failure${context ? ` in ${context}` : ''}`, error, 'validation');
    throw error;
  }
}

// Re-export common schemas for convenience
export { z } from 'zod';
