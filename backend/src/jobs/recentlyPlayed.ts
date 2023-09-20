import { type User } from "@prisma/client";
import { prisma } from "..";
import { AlbumEndpointResponse } from "../types/AlbumTypes";
import { ArtistEndpointResponse } from "../types/ArtistTypes";
import { RecentlyPlayedTrack } from "../types/TrackTypes";
import { request } from "undici";
import { ApiClient, SpotifyClient } from "../utils/SpotifyApi";

type RecentlyPlayedTracks = {
    track: RecentlyPlayedTrack;
    played_at: string;
};

const scanRecentlyPlayed = async (user: User) => {
    let usr: User = user;

    if (!user.accessToken) return console.error(`No access token for ${user.displayName ? user.displayName : user.id}. Log in again.`);
    const lastScan = user.lastScan ? user.lastScan - 1000 * 60 * 60 * 2 : Date.now() - 1000 * 60 * 60 * 2;

    const url = `/me/player/recently-played?after${lastScan}`;

    if (!(usr.expiresAt > Math.floor(Date.now() / 1000))) {
        console.log(`Refreshing access token for ${user.displayName ? user.displayName : user.id}`)
        const refreshedToken = await SpotifyClient.refreshToken(user.refreshToken);
        if (!refreshedToken) return console.error(`Failed to refresh token for ${user.displayName ? user.displayName : user.id}. Log in again.`);

        usr = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                accessToken: refreshedToken.accessToken,
                expiresAt: refreshedToken.expiresAt
            }
        });
    }

    const response = await request('https://api.spotify.com/v1' + url, {
        headers: {
            Authorization: `Bearer ${usr.accessToken}`
        }
    }).then((res) => res.body.json() as Promise<{ href: string, limit: number, next: string, total: number, items: RecentlyPlayedTracks[] }>)
        .catch((err: Error) => console.error(err));

    if (!response) return console.error(`No response for ${user.displayName ? user.displayName : user.id}.`);

    try {
        for (const item of response.items) {
            const [artists, album, track] = await prisma.$transaction([
                prisma.artist.findMany({ where: { id: { in: item.track.artists.map((artist: any) => artist.id) } } }),
                prisma.album.findUnique({ where: { id: item.track.album.id } }),
                prisma.track.findUnique({ where: { id: item.track.id } })
            ])

            if (artists.length < item.track.artists.length) {
                const artistIds = item.track.artists.filter((artist: ArtistEndpointResponse) => !artists.find((artistLookup) => artistLookup.id === artist.id));
                const artistsRes = await ApiClient.get<{ artists: ArtistEndpointResponse[] }>(`/artists?ids=${artistIds.map((artist: ArtistEndpointResponse) => artist.id).join(',')}`, user.accessToken);

                await prisma.artist.createMany({
                    data: artistsRes.artists.map((artist: ArtistEndpointResponse) => ({
                        id: artist.id,
                        userHref: artist.external_urls.spotify,
                        href: artist.href,
                        name: artist.name,
                        genres: artist.genres ?? [],
                        popularity: artist.popularity ?? 0,
                        type: artist.type,
                        uri: artist.uri
                    })),
                    skipDuplicates: true
                });

                await prisma.image.createMany({
                    data: artistsRes.artists.map((artist: ArtistEndpointResponse) => artist.images.map((image) => ({
                        height: image.height,
                        width: image.width,
                        url: image.url,
                        artistId: artist.id
                    }))).flat()
                });
            }

            if (!album) {
                const albumRes = await ApiClient.get<AlbumEndpointResponse>(`/albums/${item.track.album.id}`, user.accessToken);

                await prisma.album.create({
                    data: {
                        id: albumRes.id,
                        userHref: albumRes.external_urls.spotify,
                        href: albumRes.href,
                        albumType: albumRes.album_type,
                        totalTracks: albumRes.total_tracks,
                        name: albumRes.name,
                        releaseDate: albumRes.release_date,
                        releaseDatePrecision: albumRes.release_date_precision,
                        uri: albumRes.uri,
                        genres: albumRes.genres,
                        popularity: albumRes.popularity,
                        label: albumRes.label,
                        artists: {
                            connect: item.track.artists.map((artist: ArtistEndpointResponse) => ({ id: artist.id }))
                        }
                    }
                })

                await prisma.image.createMany({
                    data: albumRes.images.map((image) => ({
                        height: image.height,
                        width: image.width,
                        url: image.url,
                        albumId: item.track.album.id
                    }))
                });
            }

            if (!track) {
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
                        durationMs: item.track.duration_ms,
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

export default async function scanRecentlyPlayedForAllUsers() {
    setInterval(async () => {
        const users = await prisma.user.findMany({});

        for (const user of users) {
            console.log(`Scanning recently played for ${user.displayName ? user.displayName : user.id}`)
            await scanRecentlyPlayed(user);
        }
    }, 60000);
}