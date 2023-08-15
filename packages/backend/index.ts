import { PrismaClient } from "@prisma/client";
import { Crypt, SpotifyLoginApi } from "./spotify";
import { scanRecentlyPlayedForAllUsers } from "./jobs/recentlyPlayed";
import { getRecentTracksApi } from "./spotify/player/recent";

export const prisma = new PrismaClient();

async function main() {
    await scanRecentlyPlayedForAllUsers();
}
main();

Bun.serve({
    port: 9000,
    async fetch(req): Promise<Response> {
        const url = new URL(req.url);
        const path = url.pathname;

        const cookieHeader = req.headers.get("cookie");

        switch (path) {
            case "/api/login":
                return SpotifyLoginApi.login();
            case "/api/login/callback":
                const failed = url.searchParams.get("error");
                if (failed) return new Response("Failed to login", { status: 401 });

                const code = url.searchParams.get("code");
                if (!code) return new Response("Failed to login", { status: 401 });

                return SpotifyLoginApi.getAccessToken(code);
            case "/api/history":
                if (typeof cookieHeader !== "string") return new Response("Not authorized", { status: 401 });

                const cookie = await Crypt.decryptJwt(cookieHeader);
                if (!cookie.success) return new Response("Not authorized", { status: 401 });

                // const page = url.searchParams.get("page");
                return await getRecentTracksApi(cookie.payload?.userId as string);
            case "/api/album/search":
                return new Response("Not implemented", { status: 501 });
            case "/api/album":
                return new Response("Not implemented", { status: 501 });
            case "/api/artist/search":
                return new Response("Not implemented", { status: 501 });
            case "/api/artist":
                return new Response("Not implemented", { status: 501 });
            case "/api/track/search":
                return new Response("Not implemented", { status: 501 });
            case "/api/track":
                return new Response("Not implemented", { status: 501 });
            default:
                return new Response("Not found", { status: 404 });
        }
    }
})