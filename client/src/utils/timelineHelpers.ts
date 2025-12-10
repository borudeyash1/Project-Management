import { addMinutes, startOfDay, differenceInMilliseconds } from 'date-fns';
import { PIXELS_PER_HOUR, SNAP_INTERVAL_MINUTES } from '../types/timeline';

/**
 * Round a date to the nearest interval in minutes
 * @param date - The date to round
 * @param nearestTo - The interval to round to (in minutes)
 * @returns Rounded date
 */
function roundToNearestMinutes(date: Date, options: { nearestTo: number }): Date {
    const ms = 1000 * 60 * options.nearestTo;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

/**
 * Convert a pixel position on the timeline to a Date object
 * @param pixelX - X position in pixels from the start of the timeline
 * @param timelineStart - The start date/time of the timeline
 * @returns Date object representing the time at that pixel position
 */
export function pixelToDate(pixelX: number, timelineStart: Date): Date {
    const millisecondsPerPixel = (60 * 60 * 1000) / PIXELS_PER_HOUR;
    const milliseconds = pixelX * millisecondsPerPixel;
    return new Date(timelineStart.getTime() + milliseconds);
}

/**
 * Convert a Date object to a pixel position on the timeline
 * @param date - The date to convert
 * @param timelineStart - The start date/time of the timeline
 * @returns Pixel position from the start of the timeline
 */
export function dateToPixel(date: Date, timelineStart: Date): number {
    const milliseconds = differenceInMilliseconds(date, timelineStart);
    const millisecondsPerPixel = (60 * 60 * 1000) / PIXELS_PER_HOUR;
    return milliseconds / millisecondsPerPixel;
}

/**
 * Snap a date to the nearest interval (e.g., 15 minutes)
 * @param date - The date to snap
 * @param intervalMinutes - The snap interval in minutes
 * @returns Snapped date
 */
export function snapToInterval(date: Date, intervalMinutes: number = SNAP_INTERVAL_MINUTES): Date {
    return roundToNearestMinutes(date, { nearestTo: intervalMinutes });
}

/**
 * Calculate the drop position and convert to a snapped date
 * @param dropX - X coordinate of the drop relative to timeline container
 * @param timelineStart - The start date/time of the timeline
 * @param scrollLeft - Current scroll position of the timeline
 * @returns Snapped date for the task start time
 */
export function calculateDropDate(
    dropX: number,
    timelineStart: Date,
    scrollLeft: number = 0
): Date {
    const adjustedX = dropX + scrollLeft;
    const rawDate = pixelToDate(adjustedX, timelineStart);
    return snapToInterval(rawDate);
}

/**
 * Get the timeline start time for a given day
 * @param date - The date to get the timeline start for
 * @param startHour - The hour to start the timeline (e.g., 8 for 8 AM)
 * @returns Date object representing the timeline start
 */
export function getTimelineStart(date: Date = new Date(), startHour: number = 0): Date {
    const dayStart = startOfDay(date);
    return addMinutes(dayStart, startHour * 60);
}

/**
 * Calculate the width in pixels for a given duration
 * @param durationMs - Duration in milliseconds
 * @returns Width in pixels
 */
export function durationToPixels(durationMs: number): number {
    const hours = durationMs / (60 * 60 * 1000);
    return hours * PIXELS_PER_HOUR;
}

/**
 * Generate time labels for the timeline header
 * @param startHour - Start hour (e.g., 0 for midnight)
 * @param endHour - End hour (e.g., 24 for midnight next day)
 * @returns Array of time labels
 */
export function generateTimeLabels(startHour: number = 0, endHour: number = 24): string[] {
    const labels: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        labels.push(`${displayHour} ${period}`);
    }
    return labels;
}

/**
 * Check if two time ranges overlap
 * @param start1 - Start of first range
 * @param end1 - End of first range
 * @param start2 - Start of second range
 * @param end2 - End of second range
 * @returns True if ranges overlap
 */
export function doRangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
): boolean {
    return start1 < end2 && end1 > start2;
}
