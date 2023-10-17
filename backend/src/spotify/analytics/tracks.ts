import { prisma } from "../..";
import { startOfToday, endOfYesterday, startOfYesterday } from 'date-fns'
import { endOfTs, secondsFromTs, startOfTs, subFromCurrentAsDate } from "../../utils/dateUtils";

export const trackCount = async (userId: string, type: "day" | "week" | "month" | "year" | "all"): Promise<object> => {
    let baseVals: { lte: number, gte: number };
    let prevVals: { lte: number, gte: number };

    switch (type) {
        case "day":
            baseVals = { lte: endOfTs(new Date(), 'day'), gte: startOfTs(new Date(), 'day') };
            prevVals = { lte: secondsFromTs(endOfYesterday()), gte: secondsFromTs(startOfYesterday()) };
            break;

        case 'week':
            baseVals = { lte: endOfTs(new Date(), 'week'), gte: startOfTs(new Date(), 'week') };
            prevVals = { lte: endOfTs(subFromCurrentAsDate({ weeks: 1}), 'week'), gte: startOfTs(subFromCurrentAsDate({ weeks: 1}), 'week')};
            break;

        default:
            baseVals = { lte: endOfTs(new Date(), 'day'), gte: startOfTs(new Date(), 'day') };
            prevVals = { lte: secondsFromTs(endOfYesterday()), gte: secondsFromTs(startOfYesterday()) };
            break;
    }

    const basePeriodSearch = await prisma.playHistory.findMany({
        where: {
            user: {
                id: userId
            },
            playedAt: {
                ...baseVals
            },
        },
        select: {
            track: {
                select: {
                    durationMs: true
                }
            }
        }
    });

    const prevPeriodSearch = await prisma.playHistory.findMany({
        where: {
            user: {
                id: userId
            },
            playedAt: {
                ...prevVals
            }
        },
        select: {
            track: {
                select: {
                    durationMs: true
                }
            }
        }
    });

    return {
        count: basePeriodSearch.length,
        prevDayCount: prevPeriodSearch.length,
        diffPercent: Math.floor((basePeriodSearch.length / prevPeriodSearch.length) * 100),
        listenTimeMs: basePeriodSearch.reduce((a, b) => a + b.track.durationMs, 0),
        listenTimePastMs: prevPeriodSearch.reduce((a, b) => a + b.track.durationMs, 0),
        listenTimeDiffMs: basePeriodSearch.reduce((a, b) => a + b.track.durationMs, 0) - prevPeriodSearch.reduce((a, b) => a + b.track.durationMs, 0)
    }
};

export const trackCountGraph = async (userId: string, type: "day" | "week" | "month" | "year"): Promise<object> => {
    if (type === "day") return await getPastDayByHour(userId);

    return {
        success: false,
        message: "Not implemented",
        data: null
    }
};

const getPastDayByHour = async (userId: string): Promise<object> => {
    const today = Math.floor(new Date(startOfToday()).getTime() / 1000);

    const pastDay = await prisma.playHistory.findMany({
        where: {
            user: {
                id: userId
            },
            playedAt: {
                gte: today,
            }
        },
        select: {
            playedAt: true
        }
    });

    // Convert the timestamps to hours and then group in to an hour based array
    const pastDayHours = pastDay.map((item) => {
        return Math.floor((item.playedAt - today) / 3600);
    });

    // Create hour array
    const hours = Array.from(Array(24).keys()).map((item) => new Object({ hour: item, count: 0 }));


    // Map the pastDayHours array to the hours array
    pastDayHours.forEach((item) => {
        // @ts-ignore
        hours[item].count++;
    });

    return hours;
};