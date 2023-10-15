import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { TailwindIndicator } from '@/components/TailwindIndicator'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

const roboto = Roboto({
    weight: ['100', '300', '400', '500', '700', '900'],
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Spotify Dashboard',
    description: 'A dashboard for your Spotify listening history',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const headersList = headers();
    const cookiesList = cookies();

    const url = new URL(headersList.get('x-url') ?? '');

    if (!url.pathname.startsWith('/login') && !cookiesList.get('token')) {
        return redirect('/login')
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${roboto.className}`}>
                <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
                    {children}
                </ThemeProvider>
                <TailwindIndicator />
            </body>
        </html>
    )
}
