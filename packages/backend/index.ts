import { PrismaClient } from "@prisma/client";
import { SpotifyLoginApi } from "./spotify";
import { scanRecentlyPlayedForAllUsers } from "./jobs/recentlyPlayed";

export const prisma = new PrismaClient();

async function main() {
    await scanRecentlyPlayedForAllUsers();
}
main();

Bun.serve({
    port: 9000,
    fetch(req): Response | Promise<Response> {
        const url = new URL(req.url);
        const path = url.pathname;

        switch (path) {
            case "/api/login":
                return SpotifyLoginApi.login();
            case "/api/login/callback":
                const failed = url.searchParams.get("error");
                if (failed) return new Response("Failed to login", { status: 401 });

                const code = url.searchParams.get("code");
                if (!code) return new Response("Failed to login", { status: 401 });

                return SpotifyLoginApi.getAccessToken(code);
            default:
                return new Response("Not found", { status: 404 });
        }
    }
})