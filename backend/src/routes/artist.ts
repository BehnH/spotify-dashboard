import { Router } from "express";
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { prisma } from "..";

const router = Router();
export default router;

router.get("/:id", validateRequest({
    params: z.object({
        id: z.string().nonempty()
    })
}), async (req, res) => {
    const { id } = req.params;

    const artist = await prisma.artist.findUnique({
        where: {
            id: id,
        },
        include: {
            images: true,
            tracks: {
                include: {
                    album: true,
                }
            }
        }
    });

    const playHistory = await prisma.playHistory.findMany({
        where: {
            trackId: {
                in: artist!.tracks.map(track => track.id)
            }
        },
    });

    const rep = {
        artist,
        userHistory: playHistory.filter(history => history.userId === req.user!.id),
        globalPlays: playHistory.length
    }

    if (!artist) return res.status(404).send("Artist not found");

    return res.status(200).json(rep);
});