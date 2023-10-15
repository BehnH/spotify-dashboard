import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function AuthPage() {
    return (
        <>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full rounded-xl shadow border md:mt-0 sm:max-w-md xl:p-0 border-foreground">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-3xl font-semibold text-slate-100 mb-2 text-center">
                            Sign in to your account
                        </h1>
                        <Separator className="bg-white" />
                        <Link
                            href="/api/auth/login"
                            passHref
                            legacyBehavior
                        >
                            <Button
                                className={
                                    "hover:bg-[#1DB954] bg-transparent text-white flex items-center" +
                                    "h-[40px] rounded-lg py-8 font-bold p-6 mx-auto border-foreground hover:ease-in" +
                                    "border-solid border-2 fill-[#1DB954] hover:fill-white rounded-xl"
                                }
                            >
                                <Icons.spotifyIcon className="w-8 mr-4" /> Sign in with Spotify
                            </Button>
                        </Link>
                    </div>
                    <div className="flex flex-col py-4">
                        <p className="text-xs text-center text-white">This service is not affiliated with Spotify AB or it&apos;s partners</p>
                        <Link
                            href="https://github.com/BehnH/spotify-dashboard"
                            passHref
                            legacyBehavior
                        >
                            <a target="_blank" className="text-xs text-center text-blue-500 hover:text-blue-700">View on GitHub</a>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}