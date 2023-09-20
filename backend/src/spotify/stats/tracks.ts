import { startOfMonth, startOfToday, startOfWeek } from "date-fns";
import { prisma } from "../.."

export const getTopTracks = async (userId: string, type: "day" | "week" | "month" | "all") => {
    let trackSearchLimit: { gte: number, lte?: number };

    switch (type) {
        case "day":
            trackSearchLimit = {
                gte: Math.floor(new Date(startOfToday()).getTime() / 1000),
            }
            break;
        case "week":
            trackSearchLimit = {
                gte: Math.floor(new Date(startOfWeek(Date.now(), { weekStartsOn: 1 })).getTime() / 1000),
            }
            break;
        case "month":
            trackSearchLimit = {
                gte: Math.floor(new Date(startOfMonth(Date.now())).getTime() / 1000),
            }
            break;
        case "all":
            trackSearchLimit = {
                gte: 0
            }
            break;
    }

    const grouped = await prisma.playHistory.groupBy({
        by: ["trackId"],
        where: {
            user: {
                id: userId
            },
            playedAt: trackSearchLimit
        },
        _count: {
            trackId: true
        },
        orderBy: {
            _count: {
                trackId: "desc"
            }
        },
        take: 20
    })

    const tracks = await prisma.track.findMany({
        where: {
            id: {
                in: grouped.map((track) => track.trackId)
            }
        },
        include: {
            album: true
        }
    });

    const tracksWithCount = tracks.map((track) => {
        const count = grouped.find((group) => group.trackId === track.id)?._count?.trackId;
        return {
            ...track,
            count
        }
    })

    return tracksWithCount;
}