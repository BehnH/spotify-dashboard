
import { prisma } from "../..";
import { endOfToday, endOfYesterday, startOfToday, startOfWeek, startOfYesterday } from 'date-fns';

export const uniqueArtistCount = async (userId: string, type: string) => {
    let baseVals: { lte: number, gte: number };
    let prevVals: { lte: number, gte: number };

    switch (type) {
        case "pastday":
            baseVals = { lte: Math.floor(new Date(endOfToday()).getTime() / 1000), gte: Math.floor(new Date(startOfToday()).getTime() / 1000) };
            prevVals = { lte: Math.floor(new Date(endOfYesterday()).getTime() / 1000), gte: Math.floor(new Date(startOfYesterday()).getTime() / 1000) };
            break;

        default:
            baseVals = { lte: Math.floor(new Date(endOfToday()).getTime() / 1000), gte: Math.floor(new Date(startOfToday()).getTime() / 1000) };
            prevVals = { lte: Math.floor(new Date(endOfYesterday()).getTime() / 1000), gte: Math.floor(new Date(startOfYesterday()).getTime() / 1000) };
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
                    artists: {
                        select: {
                            id: true
                        }
                    }
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
                    artists: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
    });

    const basePeriodUnique = getUniqueArtistCount(basePeriodSearch);
    const prevPeriodUnique = getUniqueArtistCount(prevPeriodSearch);

    const res = {
        count: basePeriodUnique,
        prevDayCount: prevPeriodUnique,
        diffPercent: Math.floor((prevPeriodUnique / basePeriodUnique) * 100),
        diffRaw: basePeriodUnique - prevPeriodUnique,
    }

    return res;
}

const getUniqueArtistCount = (historyMap: { track: { artists: { id: string }[] } }[]) => historyMap.map((item) => item.track.artists.map((artist) => artist.id)).reduce((a, b) => a.concat(b), []).filter((item, index, array) => array.indexOf(item) === index).length;