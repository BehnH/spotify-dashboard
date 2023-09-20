import { Router } from "express";
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { prisma } from "..";

const router = Router();
export default router;

router.get('/tracks', validateRequest({
    query: z.object({
        q: z.string().nonempty(),
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
        id: z.string().nonempty()
    }),
    query: z.object({
        analysis: z.boolean().optional().default(false),
        features: z.boolean().optional().default(false)
    })
}), async (req, res) => {
    const { id } = req.params;

    try {
        const track = await prisma.track.findUnique({
            where: {
                id
            }
        });

        if (!track) return res.status(404).json({
            albums: [],
            total: 0
        });

        return res.status(200).json({
            tracks: [track],
            total: 1
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
});