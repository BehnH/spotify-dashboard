import { User } from "@prisma/client";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL: string;
            SPOTIFY_CLIENT_ID: string;
            SPOTIFY_CLIENT_SECRET: string;
            JWT_SECRET: string;
            PUBLIC_URL: string;
        }
    }
    namespace Express {
        interface Request {
            user: User
        }
    }
}

export { };