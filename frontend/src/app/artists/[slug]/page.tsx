'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar'
import { Separator } from '@/components/ui/separator';
import { ArtistInfo } from '../../../../types/Artist';
import Image from 'next/image';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { padTime } from '@/lib/padTime';
import { ArtistTracksTable } from './track-table';
import { trackTableCols } from './track-table-cols';

type ArtistInfoPageProps = {
    artist: ArtistInfo;
    userHistory: ReadonlyArray<{ id: string, userId: string, playedAt: number, trackId: string }>
    globalPlays: number;
};

export default function ArtistInfoPage({ params }: { params: { slug: string } }) {

    const [artistInfo, setArtistInfo] = useState<ArtistInfoPageProps>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/v1/artist/${params.slug}`)
            .then((res) => res.json())
            .then((data) => {
                setArtistInfo(data);
            })
    }, [params.slug]);

    useEffect(() => {
        if (artistInfo === undefined) return;
        setIsLoading(false);
    }, [artistInfo]);

    return (
        <div className='h-screen'>
            <Navbar />
            {isLoading && (
                <div className="flex w-full items-center justify-center object-center h-5/6">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && artistInfo && (
                <>
                    <div className='m-6 text-white'>
                        <h1 className='text-3xl font-semibold mb-2'>{artistInfo.artist.name}</h1>                        <div className='m-4'>
                            <Separator />
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mx-4 text-white'>
                        <div className='basis-1/3 rounded-lg p-6'>
                            <h3 className='text-xl font-semibold mb-2'>Your Stats</h3>
                            <div className='space-y-1 pt-6'>
                                <p className='text-md font-medium leading-none'>You&apos;ve listened to {artistInfo.artist.name} {artistInfo.userHistory.length} times</p>
                            </div>
                        </div>
                        <div className='basis-1/3 rounded-lg shadow-lg p-6'>
                            <h3 className='text-xl font-semibold mb-2'>Global Stats</h3>
                            <div className='space-y-1 pt-6'>
                                <p className='text-md font-medium leading-none'>On this instance, {artistInfo.artist.name} has been tracked {artistInfo.userHistory.length} times</p>
                            </div>
                        </div>
                        <div className='basis-1/4 mx-auto'>
                            <Image
                                src={artistInfo.artist.images[0].url}
                                alt={artistInfo.artist.name}
                                width={450}
                                height={450}
                                className='rounded-xl shadow-lg drop-shadow-lg'
                            />
                        </div>
                    </div>
                    <div className='mx-4 my-8'>
                        <Separator />
                    </div>
                    <div className='mx-4 text-white'>
                        <h2 className='text-2xl font-semibold mb-2'>{artistInfo.artist.name}&apos;s tracks</h2>
                        <ArtistTracksTable
                            data={artistInfo.artist.tracks.map((track) => {
                                return {
                                    name: track.name,
                                    album: track.album!.name,
                                    duration: `${padTime(new Date(track.durationMs).getMinutes())}:${padTime(new Date(track.durationMs).getSeconds())}`,
                                    popularity: `${track.popularity}%`
                                }
                            })}

                            columns={trackTableCols}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
