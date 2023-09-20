import { Response } from "express";
import { prisma } from "../..";

export const getRecentTracksApi = async (
    res: Response,
    userId: string,
    limit?: number,
    offset?: number
): Promise<Response> => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) return res.status(500).send(JSON.stringify({
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

    return res.status(200).json({
        success: true,
        message: "",
        data: tracks ? tracks : []
    });
};