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