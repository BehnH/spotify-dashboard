import { ImageObject } from "./Image";
import { Track } from "./Track";

export type ArtistInfo = {
    id: string;
    userHref: string;
    href: string;
    name: string;
    genres: string[];
    popularity: number;
    type: "artist";
    uri: string;
    images: ImageObject[];
    tracks: Track[]
}