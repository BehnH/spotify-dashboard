'use client';

import { Navbar } from "@/components/Navbar";
import { createContext, useEffect, useState } from "react";
import { ListeningHistory } from "../../../types/Track";
import useSWR from "swr";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { DataTable } from "./playHistoryTable";
import { playHistoryCols } from "./playHistoryTableCols";
import { format } from "date-fns";

interface TablePaginationContextInterface {
    pageIdx: number,
    setPageIdx: React.Dispatch<React.SetStateAction<number>>
}
export const TablePaginationContext = createContext<TablePaginationContextInterface | undefined>(undefined);

export default function PlayHistoryPage() {

    const [playHistory, setPlayHistory] = useState<ListeningHistory>();
    const [isLoading, setIsLoading] = useState(true);
    const [pageIdx, setPageIdx] = useState(0);
    useSWR(
        `/api/v1/analysis/history?offset=${pageIdx}`,
        (apiUrl: string) => fetch(apiUrl)
            .then(res => res.json())
            .then(data => setPlayHistory(data))
    );

    useEffect(() => {
        if (playHistory === undefined) return;
        setIsLoading(false);
    }, [playHistory]);

    return (
        <>
            <Navbar />
            <div className="px-6">
                <h1 className="text-3xl font-bold py-6">Play History</h1>
                {isLoading && (
                    <>
                        <div className="flex w-full items-center justify-center object-center h-5/6">
                            <LoadingSpinner />
                        </div>
                    </>
                )}
                {!isLoading && playHistory && (
                    <TablePaginationContext.Provider value={{ pageIdx, setPageIdx }}>
                        <DataTable
                            data={playHistory.tracks.map((track) => {
                                return {
                                    name: track.track.name,
                                    album: track.track.album!.name,
                                    artists: track.track.artists!.map((artist) => artist.name).join(', '),
                                    playedAt: format(new Date(track.playedAt * 1000), 'PPp')
                                }
                            })}

                            columns={playHistoryCols}
                        />
                    </TablePaginationContext.Provider>
                )}
            </div>

        </>
    )
}