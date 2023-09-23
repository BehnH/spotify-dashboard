import { prisma } from "../..";

export const getRecentTracksApi = async (
    userId: string,
    limit?: number,
    offset?: number
) => {
    const tracks = await prisma.playHistory.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            playedAt: 'desc'
        },
        include: {
            track: {
                include: {
                    artists: {
                        select: {
                            id: true,
                            name: true,
                            href: true,
                            userHref: true
                        }
                    },
                    album: {
                        select: {
                            id: true,
                            name: true,
                            href: true,
                            userHref: true,
                            images: {
                                select: {
                                    id: true,
                                    height: true,
                                    width: true,
                                    url: true
                                }
                            }
                        }
                    },
                },
            },
        },
        take: limit ? limit : 20,
        skip: offset ? offset : 0
    });

    return {
        tracks,
        total: tracks.length
    };
};