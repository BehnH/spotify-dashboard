import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { millisecondsToHours } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function PlayHistoryTrackCard({ track }: { track: any }) {

    return (
        <>
            <div className="relative flex flex-shrink-0 w-96 flex-col rounded-xl bg-slate-100 dark:bg-slate-300 text-gray-700 shadow-md">
                <div className="relative mx-4 -mt-6 h-56 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40">
                    <Image
                        src={track.track.album.images[0].url}
                        alt="img-blur-shadow"
                        width={640}
                        height={640}
                        priority
                    />
                </div>
                <div className="p-6">
                    <h5 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                        {track.track.name}
                    </h5>
                    <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
                        {track.track.artists.map((artist: any) => {
                            return (
                                <Link
                                    key={artist.id}
                                    href={`/artists/${artist.id}`}
                                    className='hover:text-blue-500'
                                >
                                    {artist.name}
                                </Link>
                            )
                        }).reduce((prev: React.JSX.Element, curr: React.JSX.Element) => [prev, ', ', curr])}
                    </p>
                </div>
            </div>
        </>
    )
}

export function OverviewLoadingCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Crunching the numbers...
                </CardTitle>
            </CardHeader>
        </Card>
    )


    // return (
    //     <>
    //         <div className="relative flex flex-shrink-0 lg:w-96 flex-col rounded-xl bg-slate-100 dark:bg-slate-300 text-gray-700 shadow-md">
    //             <div className="p-2">
    //                 <h5 className="mb-2 font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
    //                     Crunching the numbers...
    //                 </h5>
    //             </div>
    //         </div>
    //     </>
    // )
}

export function ArtistHistroyTrackDiff({ count, diffCount, diffPercent }: { count: number, diffCount: number, diffPercent: number }) {
    return (
        <Card className='rounded-xl'>
            <CardHeader>
                <CardTitle>
                    You&apos;ve listened to {count} artists today
                </CardTitle>
                <CardDescription className='flex flex-row flex-nowrap'>
                    {diffCount > 0 ? <ChevronsUp color="#01c618" strokeWidth={3} /> : <ChevronsDown color="#c60101" strokeWidth={3} />}
                    <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
                        That&apos;s {diffCount} {diffCount > 0 ? 'more' : 'less'} than yesterday ({diffPercent}%)
                    </p>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}

export function PlayHistroyTrackDiff({ count, prevDayCount, diffPercent }: { count: number, prevDayCount: number, diffPercent: number }) {
    return (
        <Card className='rounded-xl'>
            <CardHeader>
                <CardTitle>
                    You&apos;ve listened to {count} tracks today
                </CardTitle>
                <CardDescription className='flex flew-row flex-nowrap'>
                    {Math.floor(count - prevDayCount) > 0 ? <ChevronsUp color="#01c618" strokeWidth={3} /> : <ChevronsDown color="#c60101" strokeWidth={3} />}
                    <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
                        That&apos;s {Math.abs(count - prevDayCount)} {Math.floor(count - prevDayCount) > 0 ? 'more' : 'less'} than yesterday ({diffPercent}%)
                    </p>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}

// listenTimePastMs: number;
// listenTimeDiffMs: number;

export function PlayHistoryListenTime({
    listenTimeMs,
    listenTimePastMs,
    listenTimeDiffMs
}: {
    listenTimeMs: number,
    listenTimePastMs: number,
    listenTimeDiffMs: number
}) {
    return (
        <Card className='rounded-xl'>
            <CardHeader>
                <CardTitle>
                    You&apos;ve listened for {millisecondsToHours(listenTimeMs)} hours today
                </CardTitle>
                <CardDescription className='flex flew-row flex-nowrap'>
                    {listenTimeMs > listenTimePastMs ? <ChevronsUp color="#01c618" strokeWidth={3} /> : <ChevronsDown color="#c60101" strokeWidth={3} />}
                    <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
                        That&apos;s {millisecondsToHours(listenTimePastMs)} {listenTimeMs > listenTimePastMs ? ' more' : ' less'} than yesterday
                    </p>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}

export function SkeletonCard() {
    return (
        <>
            <div className="relative flex flex-shrink-0 lg:w-96 flex-col rounded-xl bg-slate-100 dark:bg-slate-300 text-gray-700 shadow-md">
                <div className="p-2">
                    <Skeleton className="mb-2 h-7 w-full drop-shadow-md" />
                    <div className="flex flex-row flex-nowrap">
                        <Skeleton className="h-6 w-full drop-shadow-md" />
                    </div>
                </div>
            </div>
        </>
    )
}