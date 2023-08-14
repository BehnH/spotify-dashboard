import { User } from "@prisma/client";
import { refreshAccessToken } from "../spotify/auth/refresh";
import { prisma } from "..";
import { AlbumEndpointResponse } from "../types/AlbumTypes";
import { ArtistEndpointResponse } from "../types/ArtistTypes";
import { RecentlyPlayedTrack } from "../types/TrackTypes";

type RecentlyPlayedTracks = {
    track: RecentlyPlayedTrack;
    played_at: string;
};

export const scanRecentlyPlayed = async (user: User) => {
    let usr: User = user;

    if (!user.accessToken) return console.error(`No access token for ${user.displayName ? user.displayName : user.id}. Log in again.`);
    const lastScan = user.lastScan ? user.lastScan - 1000 * 60 * 60 * 2 : Date.now() - 1000 * 60 * 60 * 2;

    const url = `/me/player/recently-played?after${lastScan}`;

    if (!(usr.expiresAt > Math.floor(Date.now() / 1000))) {
        console.log(`Refreshing access token for ${user.displayName ? user.displayName : user.id}`)
        usr = await refreshAccessToken(user.refreshToken);
    }

    const response = await fetch('https://api.spotify.com/v1' + url, {
        headers: {
            Authorization: `Bearer ${usr.accessToken}`
        }
    }).then((res: Response) => res.json() as Promise<{ href: string, limit: number, next: string, total: number, items: RecentlyPlayedTracks[] }>)
        .catch((err: Error) => console.error(err));

    if (!response) return console.error(`No response for ${user.displayName ? user.displayName : user.id}.`);

    try {
        for (const item of response.items) {
            const artistLookup = await prisma.artist.findMany({
                where: {
                    id: {
                        in: item.track.artists.map((artist: any) => artist.id)
                    }
                }
            });

            const albumLookup = await prisma.album.findMany({
                where: {
                    id: item.track.album.id
                }
            });

            const trackLookup = await prisma.track.findMany({
                where: {
                    id: item.track.id
                }
            });


            // Create artists if they don't exist
            if (artistLookup.length < item.track.artists.length) {
                const artistIds = item.track.artists.filter((artist: ArtistEndpointResponse) => !artistLookup.find((artistLookup) => artistLookup.id === artist.id));
                const artists: { artists: ArtistEndpointResponse[] } = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.map((artist: ArtistEndpointResponse) => artist.id).join(',')}`, {
                    headers: {
                        Authorization: `Bearer ${usr.accessToken}`
                    }
                }).then((res: Response) => res.json())


                await prisma.artist.createMany({
                    data: artists.artists.map((artist: ArtistEndpointResponse) => ({
                        id: artist.id,
                        userHref: artist.external_urls.spotify,
                        href: artist.href,
                        name: artist.name,
                        genres: artist.genres ?? [],
                        popularity: artist.popularity ?? 0,
                        type: artist.type,
                        uri: artist.uri
                    }))
                });

                await prisma.image.createMany({
                    data: artists.artists.map((artist: ArtistEndpointResponse) => artist.images.map((image) => ({
                        height: image.height,
                        width: image.width,
                        url: image.url,
                        artistId: artist.id
                    }))).flat()
                });
            }

            // Create album if it doesn't exist
            if (albumLookup.length < 1) {
                const album: AlbumEndpointResponse = await fetch(item.track.album.href, {
                    headers: {
                        Authorization: `Bearer ${usr.accessToken}`
                    }
                }).then((res: Response) => res.json());

                await prisma.album.create({
                    data: {
                        id: album.id,
                        userHref: album.external_urls.spotify,
                        href: album.href,
                        albumType: album.album_type,
                        totalTracks: album.total_tracks,
                        name: album.name,
                        releaseDate: album.release_date,
                        releaseDatePrecision: album.release_date_precision,
                        uri: album.uri,
                        genres: album.genres,
                        popularity: album.popularity,
                        label: album.label,
                    }
                })

                await prisma.image.createMany({
                    data: album.images.map((image) => ({
                        height: image.height,
                        width: image.width,
                        url: image.url,
                        albumId: item.track.album.id
                    }))
                });

            }

            // Create track if it doesn't exist
            if (trackLookup.length < 1) {
                await prisma.track.create({
                    data: {
                        id: item.track.id,
                        userHref: item.track.external_urls.spotify,
                        href: item.track.href,
                        name: item.track.name,
                        popularity: item.track.popularity,
                        trackNumber: item.track.track_number,
                        type: "track",
                        uri: item.track.uri,
                        isLocal: item.track.is_local,
                        albumId: item.track.album.id,
                        artists: {
                            connect: item.track.artists.map((artist: ArtistEndpointResponse) => ({ id: artist.id }))
                        }
                    },
                });
            }

            await prisma.playHistory.createMany({
                data: {
                    playedAt: Math.floor(new Date(item.played_at).getTime() / 1000),
                    trackId: item.track.id,
                    userId: user.id
                },
                skipDuplicates: true
            });

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    lastScan: Math.floor(Date.now() / 1000)
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
}

export const scanRecentlyPlayedForAllUsers = async () => {
    setInterval(async () => {
        const users = await prisma.user.findMany({});

        for (const user of users) {
            console.log(`Scanning recently played for ${user.displayName ? user.displayName : user.id}`)
            await scanRecentlyPlayed(user);
        }
    }, 60000);
}