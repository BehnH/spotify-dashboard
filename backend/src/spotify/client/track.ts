import { User } from "@prisma/client";
import { request } from "undici";
import logger from "../../utils/logger";

export const getTrack = async (id: string, user: User) => {
    return await request(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json())
    .catch((err: Error) => logger.error(err));
};

export const getTracks = async (ids: string[], user: User) => {
    return await request(`https://api.spotify.com/v1/tracks?ids=${ids.join(',')}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json())
    .catch((err: Error) => logger.error(err));
};

export const getTrackAudioFeatures = async (id: string, user: User): Promise<void | Object> => {
    return await request(`https://api.spotify.com/v1/audio-features/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json() as Promise<Object>)
    .catch((err: Error) => logger.error(err));
};

export const getTracksAudioFeatures = async (ids: string[], user: User): Promise<void | Object> => {
    return await request(`https://api.spotify.com/v1/audio-features?ids=${ids.join(',')}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json() as Promise<Object>)
    .catch((err: Error) => logger.error(err));
};

export const getTrackAudioAnalysis = async (id: string, user: User): Promise<void | Object> => {
    return await request(`https://api.spotify.com/v1/audio-analysis/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res) => res.body.json() as Promise<Object>)
    .catch((err: Error) => logger.error(err));
};