import { Router } from "express";
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { getTopTracks } from "../spotify/stats/tracks";
import { getRecentTracksApi } from "../spotify/player/recent";
import { trackCountGraph } from "../spotify/analytics/tracks";

const router = Router();
export default router;

router.get("/history",
    validateRequest({
        query: z.object({
            limit: z.number().optional().default(20),
            offset: z.number().optional().default(0)
        }),
    }),
    async (req, res) => {
        const { limit, offset } = req.query;

        return await getRecentTracksApi(res, req.user!.id, limit, offset);
    }
);

router.get("/tracks",
    validateRequest({
        query: z.object({
            type: z.enum(["day", "week", "month", "year"]).default("day"),
            trackdata: z.boolean().optional().default(false),
        }),
    }),
    async (req, res) => {
        return res.status(501).send("Not implemented");
    }
)

router.get("/tracks/graph",
    validateRequest({
        query: z.object({
            type: z.enum(["day", "week", "month", "year"]).default("day"),
        }),
    }),
    async (req, res) => {
        const { type } = req.query;

        const analysis = await trackCountGraph(req.user!.id, type!);
        return res.status(200).json(analysis);
    }
)


router.get("/tracks/top",
    validateRequest({
        query: z.object({
            type: z.enum(["day", "month", "all"]).default("day"),
        }),
    }),
    async (req, res) => {
        const { type } = req.query;

        const tracks = await getTopTracks(req.user!.id, type!);

        return res.status(200).json({
            tracks,
            total: tracks.length
        });
    }
)

router.get("/artists",
    validateRequest({
        query: z.object({
            type: z.enum(["day", "month", "all"]).optional().default("day"),
        }),
    }),
    async (req, res) => {
        const { type } = req.query;

        return res.status(501).send("Not implemented");
    }
)