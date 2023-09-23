'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar'
import { Separator } from '@/components/ui/separator';
import { ArtistInfo } from '../../../../types/Artist';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/loading-spinner';

function padTime(i: number) { return ('0' + i).slice(-2) };
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
                        <h1 className='text-3xl font-semibold mb-2'>{artistInfo.artist.name}</h1>
                        <h5 className='text-md font-light mb-2'>Here&apos;s some insights in to {artistInfo.artist.name}</h5>
                        <div className='m-4'>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Track Name</TableHead>
                                    <TableHead>Album</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Popularity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {artistInfo.artist.tracks.map((track) => {
                                    const time = new Date(track.durationMs)

                                    return (
                                        <TableRow key={track.id!}>
                                            <TableCell>{track.name!}</TableCell>
                                            <TableCell>{track?.album?.name}</TableCell>
                                            <TableCell>{padTime(time.getMinutes())}:{padTime(time.getSeconds())}</TableCell>
                                            <TableCell>{track.popularity!}%</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}
        </div>
    )
}
