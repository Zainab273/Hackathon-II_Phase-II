/**
 * Date and time formatting utilities
 * @see specs/003-frontend-integration/data-model.md
 */

/**
 * Format ISO 8601 datetime for display with exact date and time
 * Returns date and time in local timezone with proper formatting
 *
 * Examples:
 * - "Today at 3:45 PM"
 * - "Feb 9, 2026 at 10:30 AM"
 *
 * @param isoString - ISO 8601 datetime (e.g., "2026-02-06T10:30:00Z")
 * @returns Human-readable date and time string
 */
export function formatTaskDate(isoString: string): string {
  try {
    // Parse the ISO string to Date object
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Get current date for comparison
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    // Format date part: "Feb 9, 2026" or "Today"
    const datePart = isToday ? 'Today' : date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Format time part: "3:45 PM"
    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${datePart} at ${timePart}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format ISO 8601 datetime for display (relative time)
 * Returns relative time for recent dates, absolute for older dates
 *
 * Examples:
 * - "just now" (< 1 minute)
 * - "5m ago" (5 minutes)
 * - "3h ago" (3 hours)
 * - "2d ago" (2 days)
 * - "Jan 30" (this year)
 * - "Dec 15, 2025" (different year)
 *
 * @param isoString - ISO 8601 datetime (e.g., "2026-02-06T10:30:00Z")
 * @returns Human-readable date string
 */
export function formatTaskDateRelative(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  // Less than 1 minute
  if (diffMins < 1) return 'just now';

  // Less than 1 hour
  if (diffMins < 60) return `${diffMins}m ago`;

  // Less than 24 hours
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  // Less than 7 days
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  // Absolute date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
