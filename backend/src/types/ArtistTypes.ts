import { ImageObject } from "./Generic";

export type ArtistEndpointResponse = {
    external_urls: {
        spotify: string;
    };
    followers: {
        href: null;
        total: number;
    };
    genres: string[];
    href: string;
    id: string;
    images: ImageObject[];
    name: string;
    popularity: number;
    type: "artist";
    uri: string;
}

export type FetchManyArtistsResponse = {
    artists: ArtistEndpointResponse[];
}

export type SimplifiedArtistObject = {
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    name: string;
    type: "artist";
    uri: string;
}