import { prisma } from "../..";
import { Response } from "express-serve-static-core";
import { encryptJwt, formServiceAuthHeader } from "./crypt";
import { request } from "undici";
import querystring from "node:querystring";

type AccessTokenData = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
};

type UserData = {
    id: string;
    email: string;
    display_name: string | null;
    error?: {
        status: number;
        message: string;
    }
};

export const login = async (res: Response) => {
    const url = new URL('https://accounts.spotify.com/authorize');

    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID as string);
    url.searchParams.append('scope', 'user-read-private user-read-email user-read-recently-played');
    url.searchParams.append('redirect_uri', `${process.env.PUBLIC_URL}/api/auth/login/callback`);

    return res.redirect(301, url.href)
};

export const logout = (res: Response): Response => {
    return res.status(301)
        .setHeader('Set-Cookie', `token=null; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/; HttpOnly; SameSite=Strict;`)
        .setHeader('Cache-Control', 'no-cache')
        .setHeader('Location', `${process.env.PUBLIC_URL}/auth`);
}

export const getAccessToken = async (res: Response, code: string) => {
    try {
        const responseData: AccessTokenData = await request('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${formServiceAuthHeader().toString('base64')}`
            },
            body: querystring.stringify({
                code,
                redirect_uri: `${process.env.PUBLIC_URL}/api/auth/login/callback`,
                grant_type: 'authorization_code'
            })
        }).then((res) => res.body.json() as Promise<AccessTokenData>);

        const user: UserData = await request('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${responseData.access_token}`
            }
        }).then((res) => res.body.json() as Promise<UserData>);

        if (user.error) return res.status(401).send(JSON.stringify({
            success: false,
            message: user.error.message
        }));

        await prisma.user.upsert({
            where: {
                id: user.id
            },
            update: {
                accessToken: responseData.access_token,
                refreshToken: responseData.refresh_token,
                expiresAt: Math.floor(Date.now() / 1000) + responseData.expires_in,
                displayName: user.display_name,
                email: user.email,
            },
            create: {
                id: user.id,
                email: user.email,
                accessToken: responseData.access_token,
                refreshToken: responseData.refresh_token,
                expiresAt: Math.floor(Date.now() / 1000) + responseData.expires_in,
                scope: responseData.scope,
                displayName: user.display_name,
                tokenType: responseData.token_type
            }
        });

        const token = await encryptJwt({ userId: user.id })

        return res
            .setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict;`)
            .setHeader('Cache-Control', 'no-cache')
            .redirect(301, process.env.PUBLIC_URL)


    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: error })
    }
};