import { PrismaClient, User } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request } from "express";
import helmet from "helmet";
import { getAccessToken, login, logout } from "./spotify/auth/login";
import { decryptJwt } from "./spotify/auth/crypt";
import { getRecentTracksApi } from "./spotify/player/recent";
import { trackCount } from "./spotify/analytics/tracks";
import { artistCount } from "./spotify/analytics/artists";
import { getTrackAudioAnalysis, getTrackAudioFeatures } from "./spotify/client/track";
import scanRecentlyPlayedForAllUsers from "./jobs/recentlyPlayed";
import morgan from "morgan";

export const prisma = new PrismaClient();

interface RequestWithUser extends Request {
    user?: User;
}

async function main() {
    await scanRecentlyPlayedForAllUsers();
}
main();

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app: Express = express();
const port = process.env.port !== undefined ? parseFloat(process.env.PORT as string) : 9000;

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

app.get("/api/auth/login", (req, res) => {
    return login(res);
});

app.get("/api/auth/login/callback", async (req, res) => {
    const error = req.query?.error;
    const code = req.query?.code;

    if (error) {
        return res.status(401).send("Failed to login");
    }

    if (!code) {
        return res.status(401).send("Failed to login");
    }

    const response = await getAccessToken(res, code as string);
    return response;
});

app.get("/api/auth/logout", (req: RequestWithUser, res) => {
    return logout(res);
});

// Require authentication for all api/v1 routes
app.use("/api/v1", async function (req: RequestWithUser, res, next) {
    const cookieHeader = req.headers.cookie;
    if (typeof cookieHeader !== "string" || !cookieHeader) return res.status(401).send("Not authorized");

    console.log('cookieHeader', cookieHeader)

    const cookie = await decryptJwt(cookieHeader);
    if (!cookie.success) {
        return res.status(401).send("Not authorized");
    };

    console.log('cookie', cookie)

    const userFetch = await prisma.user.findUnique({
        where: {
            id: cookie.payload?.userId as string
        }
    });

    if (userFetch) {
        req.user = userFetch;
        return next();
    } else {
        return res.status(401).send("Not authorized");
    }
});

app.get("/api/v1/whoami", (req: RequestWithUser, res) => {
    return res.json({
        success: true,
        message: "User is logged in",
        data: req.user
    });
});

app.get("/api/v1/history", async (req: RequestWithUser, res) => {
    const historyLimit = req.query?.limit;
    return await getRecentTracksApi(res, req.user!.id, historyLimit ? parseInt(historyLimit as string) : undefined)
});

app.get("/api/v1/analytics/tracks", async (req: RequestWithUser, res) => {
    const trackCountType = req.query?.type;
    const allowedTrackCountTypes = ["pastday", "pastweek", "all"];
    if (trackCountType === null || !allowedTrackCountTypes.includes(trackCountType as string)) return res.status(501).send("You must specify a URL param called type with the option \"new\",\"pastday\",\"pastweek\",\"all\"");

    const trackCountRes = await trackCount(req.user!.id, trackCountType as any);
    return res.status(200).json(trackCountRes);
});

app.get("/api/v1/analytics/artists", async (req: RequestWithUser, res) => {
    const artistCountType = req.query?.type;
    const allowedArtistCountTypes = ["pastday", "pastweek", "all"];
    if (artistCountType === null || !allowedArtistCountTypes.includes(artistCountType as string)) return res.status(501).send("You must specify a URL param called type with the option \"new\",\"pastday\",\"pastweek\",\"all\"");

    const artistCountResponse = await artistCount(req.user!.id, artistCountType as any);
    return res.status(200).json(artistCountResponse);
});

app.get("/api/v1/analytics/albumcount", (req: RequestWithUser, res) => {
    return res.status(501).send("Not implemented");
});

app.get("/api/v1/album/search", (req: RequestWithUser, res) => {
    return res.status(501).send("Not implemented");
});

app.get("/api/v1/album", (req: RequestWithUser, res) => {
    return res.status(501).send("Not implemented");
});

app.get("/api/v1/artist/search", (req: RequestWithUser, res) => {
    return res.status(501).send("Not implemented");
});

app.get("/api/v1/artist", async (req: RequestWithUser, res) => {
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

app.get("/api/v1/track/search", (req: RequestWithUser, res) => {
    return res.status(501).send("Not implemented");
});

app.get("/api/v1/track", async (req: RequestWithUser, res) => {
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

app.listen(9000, '::', () => {
    console.log(process.env.DATABASE_URL)
    console.log(`Listening on port 9000`);
});