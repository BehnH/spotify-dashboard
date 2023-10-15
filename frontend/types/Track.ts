import { AlbumInfo } from "./Album";
import { ArtistInfo } from "./Artist";

export type Track = {
    id: string;
    userHref: string;
    href: string;
    name: string;
    popularity: number;
    trackNumber: number;
    type: "track";
    uri: string;
    isLocal: boolean;
    durationMs: number;
    albumId: string;
    artists?: ArtistInfo[];
    album?: AlbumInfo;
}

export type TrackAnalytics = {
    count: number;
    prevDayCount: number;
    diffPercent: number;
    listenTimeMs: number
    listenTimePastMs: number;
    listenTimeDiffMs: number;
}

export type ListeningHistory = {
    total: number;
    tracks: {
        id: string;
        userId: string;
        playedAt: number;
        trackId: string;
        track: Track;
    }[];
}