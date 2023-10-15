
import { prisma } from "../..";
import { endOfYesterday, startOfYesterday } from 'date-fns';
import { endOfTs, secondsFromTs, startOfTs } from "../../utils/dateUtils";

export const uniqueArtistCount = async (userId: string, type: string) => {
    let baseVals: { lte: number, gte: number };
    let prevVals: { lte: number, gte: number };

    switch (type) {
        case "pastday":
            baseVals = { lte: endOfTs(new Date(), 'day'), gte: startOfTs(new Date(), 'day') };
            prevVals = { lte: secondsFromTs(endOfYesterday()), gte: secondsFromTs(startOfYesterday()) };
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
        diffPercent: Math.floor((basePeriodUnique / prevPeriodUnique) * 100),
        diffRaw: basePeriodUnique - prevPeriodUnique,
    }

    return res;
}

const getUniqueArtistCount = (historyMap: { track: { artists: { id: string }[] } }[]) => historyMap.map((item) => item.track.artists.map((artist) => artist.id)).reduce((a, b) => a.concat(b), []).filter((item, index, array) => array.indexOf(item) === index).length;