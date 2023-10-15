'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar'
import { ArtistHistroyTrackDiff, PlayHistoryListenTime, PlayHistroyTrackDiff } from '@/components/Cards/OverviewCards';
import useSWR from 'swr';
import { Separator } from '@/components/ui/separator';
import { ListeningHistory, TrackAnalytics } from '../../types/Track';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { PlayHistoryTrackCard } from '@/components/Cards/RecentTrackCard';

export default function Home() {

    const [playHistory, setPlayHistory] = useState<ListeningHistory>();
    const [trackAnalytics, setTrackAnalytics] = useState<TrackAnalytics>();
    const [artistAnalytics, setArtistAnalytics] = useState<{ count: number, prevDayCount: number, diffCount: number, diffPercent: number }>();
    const [user, setUser] = useState<{ name: string, image: string }>({ name: '', image: '' });

    useSWR('/api/v1/analysis/history', (apiUrl: string) => fetch(apiUrl).then(res => res.json()).then(data => setPlayHistory(data)));
    useSWR('/api/v1/analytics/tracks?type=pastday', (apiUrl: string) => fetch(apiUrl).then(res => res.json()).then(data => setTrackAnalytics({
        count: data.count,
        prevDayCount: data.prevDayCount,
        diffPercent: data.diffPercent,
        listenTimeMs: data.listenTimeMs,
        listenTimePastMs: data.listenTimePastMs,
        listenTimeDiffMs: data.listenTimeDiffMs
    })));
    useSWR('/api/v1/analytics/artists?type=pastday', (apiUrl: string) => fetch(apiUrl).then(res => res.json()).then(data => setArtistAnalytics({
        count: data.count,
        prevDayCount: data.prevDayCount,
        diffCount: data.diffRaw,
        diffPercent: data.diffPercent
    })));
    useSWR('/api/v1/whoami', (apiUrl: string) => fetch(apiUrl).then(res => res.json()).then(data => setUser({ name: data.data.displayName, image: data.data.image })));

    return (
        <div className='h-screen'>
            <Navbar />

            <div className='m-6'>
                <div>
                    <h1 className='text-3xl font-semibold text-white mb-2'>👋 Hey{user.name ? `, ${user.name}` : ''}!</h1>
                    <h5 className='text-md font-light text-white mb-2'>Here&apos;s what happened over the past day</h5>
                </div>
                <div className='m-4'>
                    <Separator />
                </div>
                <h2 className='text-2xl font-semibold text-white mb-2'>Your Overview</h2>
                {(!trackAnalytics || !artistAnalytics) && (
                    <div className="flex w-full items-center justify-center object-center">
                        <LoadingSpinner />
                    </div>
                )}
                {trackAnalytics && artistAnalytics && (
                    <div className='flex flex-col md:grid md:grid-cols-2 xl:grid-cols-3 justify-items-center gap-2'>
                        <PlayHistroyTrackDiff
                            count={trackAnalytics.count}
                            prevDayCount={trackAnalytics.prevDayCount}
                            diffPercent={trackAnalytics.diffPercent}
                        />
                        <ArtistHistroyTrackDiff
                            count={artistAnalytics.count}
                            diffCount={artistAnalytics.diffCount}
                            diffPercent={artistAnalytics.diffPercent}
                        />
                        <PlayHistoryListenTime
                            listenTimeMs={trackAnalytics.listenTimeMs}
                            listenTimePastMs={trackAnalytics.listenTimePastMs}
                            listenTimeDiffMs={trackAnalytics.listenTimeDiffMs}
                        />
                    </div>
                )}
            </div>
            <h2 className='text-2xl font-semibold px-6 text-white mb-6'>20 Most Recent Tracks</h2>
            {!playHistory && (
                <div className="flex w-full items-center justify-center object-center">
                    <LoadingSpinner />
                </div>
            )}
            <div className='flex flex-col md:grid md:grid-cols-2 xl:grid-cols-3 justify-items-center gap-8 px-8'>
                {playHistory && playHistory.tracks.map((track) => {
                    return (
                        <PlayHistoryTrackCard key={track.id} track={track} />
                    )
                })}
            </div>
        </div>
    )
}
