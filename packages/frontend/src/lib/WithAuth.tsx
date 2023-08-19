'use client';

import { useEffect } from 'react';

export default function WithAuth({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        fetch('/api/whoami')
            .then((res) => {
                if (res.status !== 200) {
                    window.location.href = '/login';
                }
            })
    }, []);

    return (
        <>
            {children}
        </>
    )
}