import { ImageObject } from "./Generic";

export type AlbumEndpointResponse = {
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
    popularity: number;
    artists: AlbumArtistResponse[];
    label: string;
}

export type AlbumArtistResponse = {
    id: string;
    name: string;
    href: string;
    external_urls: {
        spotify: string;
    };
    uri: string;
    type: "artist";
    genres: string[];
    images: ImageObject[];
    popularity: number;
}