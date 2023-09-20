import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { getRecentTracksApi } from "./spotify/player/recent";
import { trackCount } from "./spotify/analytics/tracks";
import { uniqueArtistCount } from "./spotify/analytics/artists";
import { getTrackAudioAnalysis, getTrackAudioFeatures } from "./spotify/client/track";
import scanRecentlyPlayedForAllUsers from "./jobs/recentlyPlayed";
import morgan from "morgan";
import { getTopTracks } from "./spotify/stats/tracks";

import loginRouter from "./routes/auth";
import albumRouter from "./routes/album";
import artistRouter from "./routes/artist";
import trackRouter from "./routes/track";
import analysisRouter from "./routes/analysis";
import { JWTUtils } from "./utils/jwtUtils";
import { validateRequest } from "zod-express-middleware";
import z from "zod";

export const prisma = new PrismaClient();

async function main() {
    await scanRecentlyPlayedForAllUsers();
}
main();

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app: Express = express();

app.use(helmet());
app.use(cors({
    origin: undefined,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(morgan('combined'))

app.get("/", (req, res) => {
    res.sendStatus(404);
});

app.use("/api/auth", loginRouter);

// Require authentication for all api/v1 routes
app.use(async (req: Request, res: Response, next: NextFunction) => {
    const cookieHeader = req.headers.cookie;
    if (typeof cookieHeader !== "string" || !cookieHeader) return res.status(401).send("Not authorized");

    const cookie = await JWTUtils.decryptJwt(cookieHeader);
    if (!cookie.success) {
        return res.status(401).send("Not authorized");
    };

    const userFetch = await prisma.user.findUnique({
        where: {
            // @ts-expect-error
            id: cookie.payload?.userId as string
        }
    });

    if (userFetch) {
        req.user = userFetch;
        return next();
    } else {
        return res.status(401).send("Not authorized");
    }
})

app.use("/api/v1/album", albumRouter);
app.use("/api/v1/artist", artistRouter);
app.use("/api/v1/track", trackRouter);
app.use("/api/v1/analysis", analysisRouter);


app.get("/api/v1/whoami", (req, res) => {
    return res.json({
        success: true,
        message: "User is logged in",
        data: req.user
    });
});

app.get("/api/v1/history", validateRequest({
    query: z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0)
    }),
}), async (req, res) => {
    const { limit } = req.query;
    return await getRecentTracksApi(res, req.user!.id, limit)
});

app.get("/api/v1/analytics/tracks", async (req, res) => {
    const trackCountType = req.query?.type;
    const allowedTrackCountTypes = ["pastday", "pastweek", "all"];
    if (trackCountType === null || !allowedTrackCountTypes.includes(trackCountType as string)) return res.status(501).send("You must specify a URL param called type with the option \"new\",\"pastday\",\"pastweek\",\"all\"");

    const trackCountRes = await trackCount(req.user!.id, trackCountType as any);
    return res.status(200).json(trackCountRes);
});

app.get("/api/v1/analytics/artists", async (req, res) => {
    const artistCountType = req.query?.type;
    const allowedArtistCountTypes = ["pastday", "pastweek", "all"];
    if (artistCountType === null || !allowedArtistCountTypes.includes(artistCountType as string)) return res.status(501).send("You must specify a URL param called type with the option \"new\",\"pastday\",\"pastweek\",\"all\"");

    const artistCountResponse = await uniqueArtistCount(req.user!.id, artistCountType as any);
    return res.status(200).json(artistCountResponse);
});

app.get("/api/v1/artist", async (req, res) => {
    const artistId = req.query?.id;
    if (!artistId) return res.status(501).send("You must specify a URL param called artist");

    const artist = await prisma.artist.findUnique({
        where: {
            id: artistId as string
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

app.get("/api/v1/track", async (req, res) => {
    const trackId = req.query?.id;
    if (!trackId) return res.status(501).send("You must specify a URL param called track");

    const trackIdIncludeAnalysis = req.query?.analysis;
    const trackIdIncludeFeatures = req.query?.features;

    const track = await getTrackAudioFeatures(trackId as string, req.user!);

    const trackResponse = {
        track: track,
        analysis: {},
        features: {}
    }

    if (trackIdIncludeAnalysis === "true") {
        const audioAnalysis = await getTrackAudioAnalysis(trackId as string, req.user!);
        if (typeof audioAnalysis === "object") return trackResponse.analysis = audioAnalysis;
        return trackResponse.analysis = {};
    }

    if (trackIdIncludeFeatures === "true") {
        const audioFeatures = await getTrackAudioFeatures(trackId as string, req.user!);
        if (typeof audioFeatures === "object") return trackResponse.features = audioFeatures;
        return trackResponse.features = {};
    }

    return res.status(200).json(trackResponse);
});

app.get("/api/v1/track/top", async (req, res) => {
    const artistCountType = req.query?.type;
    const allowedArtistCountTypes = ["pastday", "pastweek", "all"];

    console.log(await getTopTracks(req.user!.id, 'day'));

    return res.status(501).send("Not implemented");
});

app.listen(9000, '::', () => {
    console.log(`Listening on port 9000`);
});