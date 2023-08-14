import { ArtistEndpointResponse, SimplifiedArtistObject } from "./ArtistTypes";
import { ImageObject } from "./Generic";

export type TrackEndpointResponse = {
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    name: string;
    popularity: number;
    artists: ArtistEndpointResponse[];
    album: TrackAlbum;
}

type TrackAlbum = {
    album_type: "album" | "single" | "compilation";
    total_tracks: number;
    available_markets: string[];
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: ImageObject[];
    name: string;
    release_date: string;
    release_date_precision: "year" | "month" | "day";
    type: "album";
    uri: string;
    genres: string[];
    label: string;
    popularity: number;
    album_group: "album" | "single" | "compilation" | "appears_on";
    artists: SimplifiedArtistObject[];
}

export type RecentlyPlayedTrack = {
    album: RecentlyPlayedTrackAlbum;
    artists: ArtistEndpointResponse[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    uri: string;
    is_local: boolean;
}

type RecentlyPlayedTrackAlbum = {
    album_type: "album" | "single" | "compilation";
    total_tracks: number;
    available_markets: string[];
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: ImageObject[];
    name: string;
    release_date: string;
    release_date_precision: "year" | "month" | "day";
    type: "album";
    uri: string;
    genres: string[];
    label: string;
    popularity: number;
    album_group: "album" | "single" | "compilation" | "appears_on";
    artists: SimplifiedArtistObject[];
}