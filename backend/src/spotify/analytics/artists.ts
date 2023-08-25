
import { prisma } from "../..";
import { startOfToday, startOfWeek, endOfToday, endOfYesterday, startOfYesterday } from 'date-fns'

const getPastPeriodToCurrent = async (userId: string, period: "pastday" | "pastweek" | "all"): Promise<{ track: { artists: { id: string }[] } }[]> => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const pastDaySeconds = nowSeconds - 86400;
    const pastWeekSeconds = nowSeconds - 604800;

    let periodValue: number;

    switch (period) {
        case "pastday":
            periodValue = Math.floor(new Date(startOfToday()).getTime() / 1000);
            break;
        case "pastweek":
            periodValue = Math.floor(new Date(startOfWeek(startOfToday())).getTime() / 1000);
            break;
        case "all":
            periodValue = 0;
            break;
    }

    return await prisma.playHistory.findMany({
        where: {
            user: {
                id: userId
            },
            playedAt: {
                gte: periodValue
            },
        },
        select: {
            track: {
                select: {
                    artists: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        },
    });
};

const getPastPeriodToPrevious = async (userId: string, period: "pastday" | "pastweek" | "all"): Promise<{ track: { artists: { id: string }[] } }[]> => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const pastDaySeconds = nowSeconds - 86400;
    const pastDaySecondsToPreviousDay = nowSeconds - (86400 * 2);
    const pastWeekSeconds = nowSeconds - 604800;
    const pastWeekSecondsToPreviousWeek = nowSeconds - (604800 * 2);

    let periodValue: number;
    let previousPeriodValue: number;

    switch (period) {
        case "pastday":
            periodValue = pastDaySeconds;
            previousPeriodValue = pastDaySecondsToPreviousDay;
            break;
        case "pastweek":
            periodValue = pastWeekSeconds;
            previousPeriodValue = pastWeekSecondsToPreviousWeek;
            break;
        case "all":
            periodValue = 0;
            previousPeriodValue = 0;
            break;
    }

    return await prisma.playHistory.findMany({
        where: {
            user: {
                id: userId
            },
            playedAt: {
                gte: periodValue,
                lte: previousPeriodValue
            },
        },
        select: {
            track: {
                select: {
                    artists: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        },
    });
}

const getUniqueArtistCount = (historyMap: { track: { artists: { id: string }[] } }[]) => historyMap.map((item) => item.track.artists.map((artist) => artist.id)).reduce((a, b) => a.concat(b), []).filter((item, index, array) => array.indexOf(item) === index).length;

export const artistCount = async (userId: string, type: "pastday" | "pastweek" | "all"): Promise<object> => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const pastWeekSeconds = nowSeconds - 604800;

    switch (type) {
        case "pastday":
            const pastDay = await getPastPeriodToCurrent(userId, type);
            const pastPreviousDay = await getPastPeriodToPrevious(userId, type);

            // Reduce the artists array, remove duplications, and return a single number
            const pastDayUnique = getUniqueArtistCount(pastDay);
            const pastPreviousDayUnique = getUniqueArtistCount(pastPreviousDay);

            const pastDayResponse = {
                count: pastDayUnique,
                diffCount: pastDayUnique - pastPreviousDayUnique,
                diffPercent: Math.floor(((pastDayUnique - pastPreviousDayUnique) / pastDay.length) * 100),
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