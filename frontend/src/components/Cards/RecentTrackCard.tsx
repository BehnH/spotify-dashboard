import Image from "next/image"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function PlayHistoryTrackCard({ track }: { track: any }) {

    return (
        <Card className="rounded-xl">
            <div className="relative mx-4 -mt-6 h-56 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40">
                <Image
                    src={track.track.album.images[0].url}
                    alt="img-blur-shadow"
                    width={640}
                    height={640}
                    priority
                />
            </div>
            <CardHeader>
                <CardTitle>
                    {track.track.name}
                </CardTitle>
                <CardDescription>
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
                </CardDescription>
            </CardHeader>
        </Card>
    )
}