import { ArtistInfo } from "./Artist";

export type AlbumInfo = {
    id: string;
    userHref: string;
    href: string;
    albumType: string;
    totalTracks: number;
    name: string;
    releaseDate: string;
    releaseDatePrecision: string;
    uri: string;
    genres: string[];
    label: string;
    popularity: number;
    artists: ArtistInfo[];
    // images: ImageObject[];
}