'use client';

import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import useSWR from "swr";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { DatePickerWithRange } from "./DateRangePicker";

const GradientColors = () => {
    return (
        <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
            <stop offset="30%" stopColor="#1DB954" stopOpacity={0.8} />
            <stop offset="55%" stopColor="#1DB954" stopOpacity={0.5} />
            <stop offset="75%" stopColor="#1DB954" stopOpacity={0.2} />
            <stop offset="90%" stopOpacity={0.0} />
        </linearGradient>
    );
};

// @ts-ignore
const TooltipStyle = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black rounded-md shadow-md p-4">
                <p className="intro">{`${payload[0].value} plays`}</p>
            </div>
        );
    }

    return null;
}

export default function PlayHistoryPage() {

    const [historyGraph, setPlayHistory] = useState<Array<{ hour: number, count: number }>>();
    const [isLoading, setIsLoading] = useState(true);
    useSWR(
        `/api/v1/analysis/tracks/graph?type=day`,
        (apiUrl: string) => fetch(apiUrl)
            .then(res => res.json())
            .then(data => setPlayHistory(data))
    );

    useEffect(() => {
        if (historyGraph === undefined) return;
        setIsLoading(false);
    }, [historyGraph]);

    return (
        <>
            <Navbar />
            <div className="px-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex"> <AlertTriangle className="mr-4 stroke-yellow-400" /> Better stats are coming soon</CardTitle>
                        <CardDescription>Have your say on spotify-dashboard&apos;s stats features by heading to <Link href={'https://github.com/behnh/spotify-dashboard/issues/54'}>this link 🔗</Link></CardDescription>
                    </CardHeader>
                </Card>
                <DatePickerWithRange />
                <h1 className="text-3xl font-bold py-6">Today&apos;s stats</h1>
                {isLoading && (
                    <>
                        <div className="flex w-full items-center justify-center object-center h-5/6">
                            <LoadingSpinner />
                        </div>
                    </>
                )}
                {!isLoading && historyGraph && (

                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={historyGraph}>
                            <defs>
                                <GradientColors />
                            </defs>
                            <XAxis
                                dataKey="hour"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                values="count"
                            />
                            { /* @ts-ignore */}
                            <Tooltip content={<TooltipStyle />} />
                            <Area
                                dataKey="count"
                                fill="url(#colorView)"
                                type={'monotone'}
                                activeDot={{ r: 3 }}
                                stroke="#fff"
                                strokeWidth={1.5}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </>
    )
}