'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar'
import { ArtistHistroyTrackDiff, PlayHistoryListenTime, PlayHistoryTrackCard, PlayHistroyTrackDiff } from '@/components/Cards/OverviewCards';
import useSWR from 'swr';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListeningHistory, TrackAnalytics } from '../../types/Track';
import WithAuth from '@/lib/WithAuth';

export default function Home() {

    const [playHistory, setPlayHistory] = useState<ListeningHistory['data']>();
    const [trackAnalytics, setTrackAnalytics] = useState<TrackAnalytics>();
    const [artistAnalytics, setArtistAnalytics] = useState<{ count: number, diffCount: number, diffPercent: number }>();
    const [user, setUser] = useState<{ name: string, image: string }>({ name: '', image: '' });
    const [isLoading, setIsLoading] = useState(true);

    useSWR('/api/history', (apiUrl: string) => fetch(apiUrl).then(res => res.json()).then(data => setPlayHistory(data.data)));
    useSWR('/api/analytics/tracks?type=pastday', (apiUrl: string) => fetch(apiUrl).then(res => res.json()).then(data => setTrackAnalytics({
        count: data.count,
        prevDayCount: data.prevDayCount,
        diffPercent: data.diffPercent,
        listenTimeMs: data.listenTimeMs,
        listenTimePastMs: data.listenTimePastMs,
        listenTimeDiffMs: data.listenTimeDiffMs
    })));

    useEffect(() => {
        fetch('/api/whoami')
            .then((res) => res.json())
            .then((data) => {
                setUser({ name: data.data.displayName, image: data.data.image });
            })
    }, []);




    useEffect(() => {
        fetch('/api/analytics/artists?type=pastday')
            .then((res) => res.json())
            .then((data) => {
                setArtistAnalytics({ count: data.count, diffCount: data.diffCount, diffPercent: data.diffPercent });
            })
    }, [])

    useEffect(() => {
        if (playHistory === undefined) return;
        if (trackAnalytics === undefined) return;
        if (artistAnalytics === undefined) return;
        setIsLoading(false);
    }, [playHistory, trackAnalytics, artistAnalytics]);

    return (
        <WithAuth>
            <div className='h-screen'>
                <Navbar />
                {isLoading && (
                    <>
                        <div className="flex w-full items-center justify-center object-center h-5/6">
                            <div className="flex h-14 w-14 relative items-center justify-center rounded-full bg-gradient-to-tr from-[#FF386B] to-[#A34FDE] animate-spin">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-dark-tremor-background-subtle"></div>
                            </div>
                        </div>
                    </>
                )}
                {!isLoading && (
                    <>
                        <div className='m-6'>
                            <div className='flex flex-row justify-between'>
                                <div>
                                    <h1 className='text-3xl font-semibold dark:text-slate-100 mb-2'>👋 Hey{user.name ? `, ${user.name}` : ''}!</h1>
                                    <h5 className='text-md font-light dark:text-slate-100 mb-2'>Here&apos;s what happened over the past day</h5>
                                </div>
                                <div>
                                    <Select defaultValue='pastday'>
                                        <SelectTrigger className='w-[180px]'>
                                            <SelectValue placeholder="Choose a period..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pastday">Past Day</SelectItem>
                                            <SelectItem value="pastweek">Past Week</SelectItem>
                                            <SelectItem value="pastmonth">Past Month</SelectItem>
                                            <SelectItem value="pastyear">Past Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='m-4'>
                                <Separator />
                            </div>
                            <h2 className='text-2xl font-semibold dark:text-slate-100 mb-2'>Your Overview</h2>
                            <div className='flex flex-col md:grid md:grid-cols-2 xl:grid-cols-3 justify-tems-center gap-2'>
                                {!isLoading && (
                                    <>
                                        <PlayHistroyTrackDiff count={trackAnalytics!.count} prevDayCount={trackAnalytics!.prevDayCount} diffPercent={trackAnalytics!.diffPercent} />
                                        <ArtistHistroyTrackDiff count={artistAnalytics!.count} diffCount={artistAnalytics!.diffCount} diffPercent={artistAnalytics!.diffPercent} />
                                        <PlayHistoryListenTime
                                            listenTimeMs={trackAnalytics!.listenTimeMs}
                                            listenTimePastMs={trackAnalytics!.listenTimePastMs}
                                            listenTimeDiffMs={trackAnalytics!.listenTimeDiffMs}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <h2 className='text-2xl font-semibold px-6 dark:text-slate-100'>20 Most Recent Tracks</h2>
                        <div className='px-2 lg:px-6 flex flex-row flex-nowrap gap-4 overflow-x-scroll flex-shrink-0 py-12 hide-scroll-bar'>
                            {playHistory!.map((track) => {
                                return (
                                    <PlayHistoryTrackCard key={track.id} track={track} />
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </WithAuth>
    )
}
