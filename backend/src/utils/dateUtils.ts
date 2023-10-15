import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear, sub } from "date-fns"

/**
 * Returns the number of seconds since the unix epoch for a given date in the past
 *
 * @param years The number of years to subtract
 * @param months The number of months to subtract
 * @param weeks The number of weeks to subtract
 * @param days The number of days to subtract
 * @param hours The number of hours to subtract
 * @returns The number of seconds since the unix epoch for a given date in the past
 */
const subFromCurrentAsNum = ({
    years,
    months,
    weeks,
    days,
    hours,
}: {
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
}): number => {
    return secondsFromTs(sub(new Date(), {
        years,
        months,
        weeks,
        days,
        hours,
    }));
};

const subFromCurrentAsDate = ({
    years,
    months,
    weeks,
    days,
    hours,
}: {
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
}): Date => {
    return sub(new Date(), {
        years,
        months,
        weeks,
        days,
        hours,
    });
};

/**
 * Returns the number of seconds since the unix epoch for a given date
 *
 * @param ts The date to convert to seconds
 * @returns The number of seconds since the unix epoch for a given date
 */
const secondsFromTs = (ts: Date): number => {
    return Math.floor(new Date(ts).getTime() / 1000)
};

/**
 * Returns the number of seconds since the unix epoch for the end of a given date
 *
 * @param ts The date to convert to seconds
 * @param unit The unit to get the end of
 * @returns The number of seconds since the unix epoch for the end of a given date
 */
const endOfTs = (ts: Date, unit: 'day' | 'week' | 'month' | 'year'): number => {
    switch (unit) {
        case 'day':
            return secondsFromTs(endOfDay(ts));
        case 'week':
            return secondsFromTs(endOfWeek(ts, {
                weekStartsOn: 1
            }));
        case 'month':
            return secondsFromTs(endOfMonth(ts));
        case 'year':
            return secondsFromTs(endOfYear(ts));
        default:
            return secondsFromTs(endOfDay(ts));
    }
};

/**
 * Returns the number of seconds since the unix epoch for the start of a given date
 *
 * @param ts The date to convert to seconds
 * @param unit The unit to get the start of
 * @returns The number of seconds since the unix epoch for the start of a given date
 */
const startOfTs = (ts: Date, unit: 'day' | 'week' | 'month' | 'year'): number => {
    switch (unit) {
        case 'day':
            return secondsFromTs(startOfDay(ts));
        case 'week':
            return secondsFromTs(startOfWeek(ts, {
                weekStartsOn: 1
            }))
        case 'month':
            return secondsFromTs(startOfMonth(ts))
        case 'year':
            return secondsFromTs(startOfYear(ts))
        default:
            return secondsFromTs(startOfDay(ts))
    }
};

export {
    subFromCurrentAsNum,
    subFromCurrentAsDate,
    secondsFromTs,
    endOfTs,
    startOfTs
};