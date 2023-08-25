import Link from "next/link"

import { cn } from "@/lib/utils"
import { PersonIcon } from "@radix-ui/react-icons"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react"
import { Separator } from "@/components/ui/separator"

export function Navbar() {
    return (
        <div className="p-4">
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                            <PersonIcon />
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="w-[200px]">
                                <ListItem
                                    id="profile"
                                    title="Profile"
                                    href="/profile"
                                >
                                    Manage your profile
                                </ListItem>
                                <ListItem
                                    id="settings"
                                    title="Settings"
                                    href="/settings"
                                >
                                    Manage your settings
                                </ListItem>
                                <Separator />
                                <ListItem
                                    id="logout"
                                    title="Logout"
                                    href="/api/auth/logout"
                                >
                                    Sign out of your account
                                </ListItem>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href={`/`} legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Home
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href={`/history`} legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Play History
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href={`/stats`} legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                All Stats
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                            Top Stats
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                <ListItem
                                    id="top-tracks"
                                    title="Top Tracks"
                                    href="/stats/tracks"
                                >
                                    Take a look at your top tracks
                                </ListItem>
                                <ListItem
                                    id="top-albums"
                                    title="Top Albums"
                                    href="/stats/albums"
                                >
                                    Take a look at your top albums
                                </ListItem>
                                <ListItem
                                    id="top-artists"
                                    title="Top Artists"
                                    href="/stats/artists"
                                >
                                    Take a look at your top artists
                                </ListItem>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}

const ListItem = forwardRef<
    ElementRef<"a">,
    ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"