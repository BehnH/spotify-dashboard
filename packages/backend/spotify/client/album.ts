import { User } from "@prisma/client";

const getAlbum = async (id: string, user: User) => {
    return await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

const getAlbums = async (ids: string[], user: User) => {
    return await fetch(`https://api.spotify.com/v1/albums?ids=${ids.join(',')}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

const getAlbumTracks = async (id: string, user: User) => {
    return await fetch(`https://api.spotify.com/v1/albums/${id}/tracks?limit=50`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    }).then((res: Response) => res.json())
    .catch((err) => console.error(err));
};

export {
    getAlbum,
    getAlbums,
    getAlbumTracks,
}