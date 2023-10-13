'use client';

import { ColumnDef } from "@tanstack/react-table";

type TrackListDef = {
    name: string;
    album: string;
    duration: string;
    popularity: string;
}

export const trackTableCols: ColumnDef<TrackListDef>[] = [
    {
        header: 'Track Name',
        accessorKey: 'name'
    },
    {
        header: 'Album',
        accessorKey: 'album'
    },
    {
        header: 'Duration',
        accessorKey: 'duration'
    },
    {
        header: 'Popularity',
        accessorKey: 'popularity'
    }
]