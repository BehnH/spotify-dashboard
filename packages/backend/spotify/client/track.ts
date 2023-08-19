import { User } from "@prisma/client";

const getTrack = async (id: string, user: User) => {
    return await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

const getTracks = async (ids: string[], user: User) => {
    return await fetch(`https://api.spotify.com/v1/tracks?ids=${ids.join(',')}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

const getTrackAudioFeatures = async (id: string, user: User) => {
    return await fetch(`https://api.spotify.com/v1/audio-features/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

const getTracksAudioFeatures = async (ids: string[], user: User) => {
    return await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids.join(',')}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

const getTrackAudioAnalysis = async (id: string, user: User) => {
    return await fetch(`https://api.spotify.com/v1/audio-analysis/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

export {
    getTrack,
    getTracks,
    getTrackAudioFeatures,
    getTracksAudioFeatures,
    getTrackAudioAnalysis
}