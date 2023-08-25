import { User } from "@prisma/client";
import { prisma } from "../..";
import { formServiceAuthHeader } from "./crypt";
import { request } from "undici";
import querystring from "node:querystring";

type RefreshTokenResponse = {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
};

export const refreshAccessToken = async (refreshToken: string): Promise<User> => {
    const token = await request('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${formServiceAuthHeader().toString('base64')}`
        },
        body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    }).then((res) => res.body.json() as Promise<RefreshTokenResponse>)

    return await prisma.user.update({
        where: {
            refreshToken: refreshToken
        },
        data: {
            accessToken: token.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + token.expires_in
        }
    });
};