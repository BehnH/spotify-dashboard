import { prisma } from "../..";
import { Crypt } from "..";

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
};

export const login = async (): Promise<Response> => {
    return Response.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID as string,
            scope: 'user-read-private user-read-email user-read-recently-played',
            redirect_uri: 'http://localhost:9000/api/login/callback'
        }), 301);
};

export const getAccessToken = async (code: string): Promise<Response> => {
    try {
        const responseData: AccessTokenData = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Crypt.formServiceAuthHeader().toString('base64')}`
            },
            body: new URLSearchParams({
                code: code as string,
                redirect_uri: 'http://localhost:9000/api/login/callback',
                grant_type: 'authorization_code'
            })
        }).then((res: Response) => res.json());

        const user: UserData = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${responseData.access_token}`
            }
        }).then((res: Response) => res.json());

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

        const token = await Crypt.encryptJwt({ userId: user.id })


        return new Response(JSON.stringify({
            success: true,
            message: null,
        }), {
            status: 200,
            headers: {
                'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Strict;`
            }
        });
    } catch (error) {
        console.error(error)
        return Response.json({ success: false, message: error })
    }
};