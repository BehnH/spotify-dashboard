import { Router } from "express";
import { ApiClient, SpotifyClient } from "../utils/SpotifyApi";
import { prisma } from "..";
import JWTUtils from "../utils/jwtUtils";
import logger from "../utils/logger";

const router = Router();
export default router;

router.get('/login', (req, res) => {
    const url = new URL('https://accounts.spotify.com/authorize');

    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    url.searchParams.append('scope', 'user-read-private user-read-email user-read-recently-played');
    url.searchParams.append('redirect_uri', `${process.env.PUBLIC_URL}/api/auth/login/callback`);

    return res.redirect(301, url.href)
});

router.get('/login/callback', async (req, res) => {
    const { code } = req.query;
    const info = await SpotifyClient.exchangeCodeForToken(code as string);

    try {
        const data = await ApiClient.get<UserData>('/me', info.accessToken)
        if (data.error) {
            logger.error(data.error);
            return res.status(data.error.status).send(data.error.message);
        }

        await prisma.user.upsert({
            where: {
                id: data.id
            },
            create: {
                id: data.id,
                email: data.email,
                displayName: data.display_name,
                accessToken: info.accessToken,
                refreshToken: info.refreshToken,
                expiresAt: Math.floor(Date.now() / 1000 + info.expiresIn),
                tokenType: info.tokenType,
                scope: info.scope
            },
            update: {
                email: data.email,
                displayName: data.display_name
            }
        });

        const token = await JWTUtils.encryptJwt({ userId: data.id });

        return res
            .setHeader('Set-Cookie', `token=${token}; Path=/; max-age=3600; HttpOnly; SameSite=Strict;`)
            .setHeader('Cache-Control', 'no-cache')
            .redirect(301, `${process.env.PUBLIC_URL}/`);
    } catch (err) {
        logger.error(err);
        return res.status(500).send('Internal server error');
    }
});

router.get('/logout', (req, res) => {
    try {
        return res
            .setHeader('Set-Cookie', `token=; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(0).toUTCString()}`)
            .setHeader('Cache-Control', 'no-cache')
            .redirect(301, `${process.env.PUBLIC_URL}/auth/login`);
    } catch (err) {
        logger.error(err);
        return res.status(500).send('Internal server error');
    }
});


type UserData = {
    id: string;
    email: string;
    display_name: string | null;
    error?: {
        status: number;
        message: string;
    }
};