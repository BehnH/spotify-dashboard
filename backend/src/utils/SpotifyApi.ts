import { request } from "undici";
import querystring from "node:querystring";
import { prisma } from "..";

type AccessTokenRes = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
};

type RefreshTokenRes = {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
};

export class SpotifyClientProvider {
    // @ts-ignore
    static getServiceAuthHeader = () => { };
    // @ts-ignore
    static exchangeCodeForToken = code => { };
    // @ts-ignore
    static refreshToken = refreshToken => { };
    // @ts-ignore
    static getUniqueId = accessToken => { };
}

export class SpotifyClient extends SpotifyClientProvider {
    static getServiceAuthHeader = () => {
        return Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`);
    }

    static exchangeCodeForToken = async (code: string) => {
        const data = await request('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${this.getServiceAuthHeader().toString('base64')}`
            },
            body: querystring.stringify({
                code,
                redirect_uri: `${process.env.PUBLIC_URL}/api/auth/login/callback`,
                grant_type: 'authorization_code'
            })
        }).then((res) => res.body.json() as Promise<AccessTokenRes>);

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope
        }
    }

    static refreshToken = async (refreshToken: string) => {
        const token = await request('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${this.getServiceAuthHeader().toString('base64')}`
            },
            body: querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        }).then((res) => res.body.json() as Promise<RefreshTokenRes>)

        return {
            accessToken: token.access_token,
            expiresAt: Math.floor((Date.now() / 1000) + token.expires_in),
        }
    }
}

export class ApiClient {

    static get = async <T>(url: string, accessToken: string) => {
        return await request(`https://api.spotify.com/v1${url}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }).then((res) => res.body.json() as Promise<T>);
    };

    static post = async <T>(url: string, accessToken: string, body: Object) => {
        return request(`https://api.spotify.com/v1${url}`,{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then((res) => res.body.json() as Promise<T>);
    };

    static put = async <T>(url: string, accessToken: string) => {
        return request(`https://api.spotify.com/v1${url}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }).then((res) => res.body.json() as Promise<T>);
    };

    static delete = async <T>(url: string, accessToken: string) => {
        return request(`https://api.spotify.com/v1${url}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }).then((res) => res.body.json() as Promise<T>);
    };
}