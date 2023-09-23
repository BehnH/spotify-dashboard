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
    console.log(id)

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

    if (!artist) return res.status(404).send("Artist not found");

    return res.status(200).json(artist);
});