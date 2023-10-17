import { Router } from "express";
import z from "zod";
import { prisma } from "..";
import { validateRequest } from "zod-express-middleware";
import logger from "../utils/logger";

const router = Router();
export default router;

router.get('/albums', validateRequest({
    query: z.object({
        q: z.string().min(1),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0)
    })
}), async (req, res) => {
    const { q, limit, offset } = req.query;

    await prisma.album.findMany({
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
    })
}), async (req, res) => {
    const { id } = req.params;

    try {
        const album = await prisma.album.findUnique({
            where: {
                id
            }
        });

        if (!album) return res.status(404).json({
            albums: [],
            total: 0
        });

        return res.status(200).json({
            albums: [album],
            total: 1
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send("Internal server error");
    }
});

router.get('/:id/tracks', validateRequest({
    params: z.object({
        id: z.string().min(1)
    }),
    query: z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0)
    })
}), (req, res) => {
    return res.status(501).send("Not implemented");
});