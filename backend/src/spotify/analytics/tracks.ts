import { prisma } from "../..";
import { startOfToday, endOfToday, endOfYesterday, startOfYesterday } from 'date-fns'

export const trackCount = async (userId: string, type: "pastday" | "pastweek" | "all"): Promise<object> => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const pastWeekSeconds = nowSeconds - 604800;

    switch (type) {
        case "pastday":
            const pastDayCount = await prisma.playHistory.findMany({
                where: {
                    user: {
                        id: userId
                    },
                    playedAt: {
                        gte: Math.floor(new Date(startOfToday()).getTime() / 1000),
                        lte: Math.floor(new Date(endOfToday()).getTime() / 1000)
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

            const previousPastDay = await prisma.playHistory.findMany({
                where: {
                    user: {
                        id: userId
                    },
                    playedAt: {
                        gte: Math.floor(new Date(startOfYesterday()).getTime() / 1000),
                        lte: Math.floor(new Date(endOfYesterday()).getTime() / 1000)
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

            const pastDayResponse = {
                count: pastDayCount.length,
                prevDayCount: previousPastDay.length,
                diffPercent: Math.floor((previousPastDay.length / pastDayCount.length) * 100),
                listenTimeMs: pastDayCount.reduce((a, b) => a + b.track.durationMs, 0),
                listenTimePastMs: previousPastDay.reduce((a, b) => a + b.track.durationMs, 0),
                listenTimeDiffMs: pastDayCount.reduce((a, b) => a + b.track.durationMs, 0) - previousPastDay.reduce((a, b) => a + b.track.durationMs, 0)
            }

            return pastDayResponse;
        case "pastweek":
            const pastWeek = await prisma.playHistory.count({
                where: {
                    user: {
                        id: userId
                    },
                    playedAt: {
                        gte: pastWeekSeconds
                    }
                }
            });

            const pastWeekDiff = pastWeek - await prisma.playHistory.count({
                where: {
                    user: {
                        id: userId
                    },
                    playedAt: {
                        gte: pastWeekSeconds - 604800,
                        lte: pastWeekSeconds
                    }
                }
            });

            const pastWeekResponse = {
                count: pastWeek,
                diffCount: pastWeekDiff,
                diffPercent: Math.floor((pastWeekDiff / pastWeek) * 100)
            }

            return pastWeekResponse;

        case "all":
            const allTime = await prisma.playHistory.count({
                where: {
                    user: {
                        id: userId
                    }
                }
            });

            return {
                count: allTime,
                diff: 0
            }
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