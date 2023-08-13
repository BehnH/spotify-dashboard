import { User } from "@prisma/client";
import { Crypt } from "..";
import { prisma } from "../..";

type RefreshTokenResponse = {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
};

export const refreshAccessToken = async (refreshToken: string): Promise<User> => {
    const token: RefreshTokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Crypt.formServiceAuthHeader().toString('base64')}`
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    }).then((res: Response) => res.json())

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