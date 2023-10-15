'use client';

import { ColumnDef } from "@tanstack/react-table";

export type History = {
    name: string;
    album: string;
    artists: string;
    playedAt: string;
}

export const playHistoryCols: ColumnDef<History>[] = [
    {
        header: 'Track Name',
        accessorKey: 'name'
    },
    {
        header: 'Album',
        accessorKey: 'album'
    },
    {
        header: 'Artists',
        accessorKey: 'artists'
    },
    {
        header: 'Played At',
        accessorKey: 'playedAt'
    }
]