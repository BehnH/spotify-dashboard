import { Router } from "express";
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { prisma } from "..";
import logger from "../utils/logger";
import { ApiClient } from "../utils/SpotifyApi";

const router = Router();
export default router;

router.get('/tracks', validateRequest({
    query: z.object({
        q: z.string().min(1),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0)
    })
}), async (req, res) => {
    const { q, limit, offset } = req.query;

    await prisma.track.findMany({
        where: {
            name: {
                contains: q?.toString()
            }
        },
        take: limit,
        skip: offset
    });

    return res.status(501).send("Not implemented");
});

router.get('/:id', validateRequest({
    params: z.object({
        id: z.string().min(1)
    }),
    query: z.object({
        analysis: z.string().optional().default('0'),
        features: z.string().optional().default('0')
    })
}), async (req, res) => {
    const { id } = req.params;

    try {
        const track = await prisma.track.findUnique({
            where: {
                id
            },
        });

        if (!track) return res.status(404).json({
            albums: [],
            total: 0
        });

        const trackRep = {
            ...track,
            analysis: req.query.analysis === '1' ? await ApiClient.get(`/audio-analysis/${track.id}`, req.user?.accessToken) : {},
            features: req.query.features === '1' ? await ApiClient.get(`/audio-features/${track.id}`, req.user?.accessToken) : {}
        }

        return res.status(200).json({
            tracks: [trackRep],
            total: 1
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send("Internal server error");
    }
});