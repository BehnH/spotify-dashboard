import { User } from "@prisma/client";
import { request } from "undici";
import logger from "../../utils/logger";

export const getAlbum = async (id: string, user: User) => {
    return await request(`https://api.spotify.com/v1/albums/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json())
    .catch((err: Error) => logger.error(err));
};

export const getAlbums = async (ids: string[], user: User) => {
    return await request(`https://api.spotify.com/v1/albums?ids=${ids.join(',')}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json())
    .catch((err: Error) => logger.error(err));
};

export const getAlbumTracks = async (id: string, user: User) => {
    return await request(`https://api.spotify.com/v1/albums/${id}/tracks?limit=50`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json())
    .catch((err: Error) => logger.error(err));
};