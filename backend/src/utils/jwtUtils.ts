import * as jose from 'jose';

export class JWTUtils {
    static encryptJwt = async (payload: jose.JWTPayload) => {
        const secret = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET);
        const algo = 'HS256';

        return await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: algo })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secret);
    };

    static decryptJwt = async (cookieHeader: string) => {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET as string);
            const cookies = this.parseCookies(cookieHeader);
            const cookie = cookies?.find((cookie) => cookie.key === 'token');

            if (!cookies || !cookie) return { success: false, message: 'No token cookie found' };

            return await jose.jwtVerify(cookie.value, secret)
                .then((payload) => {
                    return { success: true, payload: payload.payload };
                })
        } catch (err) {
            return { success: false, message: err };
        }
    };

    static parseCookies = (cookieHeader: string) => {
        const cookies: { key: string, value: string }[] = [];
        if (cookieHeader) {
            cookieHeader.split(';').forEach((cookie) => {
                const parts = cookie.split('=');
                cookies.push({ key: parts[0].trim(), value: (parts[1] || '').trim() });
            });
        }
        return cookies;
    };
}