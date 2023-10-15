import React from 'react'
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { millisecondsToHours } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

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
                        That&apos;s {Math.abs(diffCount)} {diffCount > 0 ? 'more' : 'less'} than yesterday ({diffPercent}%)
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