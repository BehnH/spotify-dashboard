import * as jose from 'jose';

type DecryptedJwt = {
    success: boolean;
    message?: string;
    payload?: jose.JWTPayload;
}

export const encryptJwt = async (payload: jose.JWTPayload): Promise<string> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const algo = 'HS256';

    return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: algo })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
};

export const decryptJwt = async (cookieHeader: string): Promise<DecryptedJwt> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const cookies = parseCookies(cookieHeader);
    const cookie = cookies?.find((cookie) => cookie.key === 'token');

    if (!cookies || !cookie) return { success: false, message: 'No token cookie found' };

    const { payload } = await jose.jwtVerify(cookie.value, secret);
    return { success: true, payload }
}

export const parseCookies = (cookie: string): null | { key: string, value: string }[] => {
    if (cookie === '') return null;

    return cookie.split(';').map((cookie) => {
        const [key, value] = cookie.split('=');
        return {
            key: key.trim(),
            value: decodeURIComponent(value.trim())
        };
    })
};

export const formServiceAuthHeader = () => {
    return Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`);
};