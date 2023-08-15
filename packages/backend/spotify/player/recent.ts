import { prisma } from "../..";

export const getRecentTracksApi = async (userId: string): Promise<Response> => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) return new Response(JSON.stringify({
        success: false,
        message: 'User not found',
        data: null
    }));

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
                            userHref: true,
                        }
                    },
                    album: {
                        select: {
                            id: true,
                            name: true,
                            href: true,
                            userHref: true,
                        }
                    },
                },
            }
        },
        take: 50,
    });

    if (!tracks) return new Response(JSON.stringify({
        success: false,
        message: 'No tracks found',
        data: null
    }));

    return new Response(JSON.stringify({
        success: true,
        message: null,
        data: tracks
    }));
};