import * as jose from 'jose';

export const encryptJwt = async (payload: jose.JWTPayload): Promise<string> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const algo = 'HS256';

    return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: algo })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
};

export const decryptJwt = async (cookieHeader: string): Promise<jose.JWTPayload | Error> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const cookies = parseCookies(cookieHeader);
    const cookie = cookies?.find((cookie) => cookie.key === 'token');

    if (!cookies || !cookie) return new Error('Invalid cookie')

    const { payload, protectedHeader } = await jose.jwtVerify(cookie.value, secret);
    return payload;
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