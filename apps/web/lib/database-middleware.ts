import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { database } from '@/lib/env'

/**
 * Higher-order function that wraps API routes with database availability checks
 * @param handler - The actual API route handler function
 * @returns Wrapped handler with database validation
 */
export function withDatabase<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    // Check if database is configured and available
    if (!database.url || !prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Call the original handler if database is available
    return handler(...args)
  }
}

/**
 * Utility function to check database availability
 * Returns error response if database is not available, null if available
 */
export function checkDatabaseAvailability(): NextResponse | null {
  if (!database.url || !prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  return null
}