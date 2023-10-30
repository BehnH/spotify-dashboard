"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DatePickerWithRange({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    })

    React.useEffect(() => {
        console.log(date)
    }, [date])

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 my-2" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        toDate={new Date()}
                    />
                    <div className="py-2" />
                    <div className="px-2">
                        <Select
                            onValueChange={(value) => {
                                const startDate = value.split(":")[0];
                                const endDate = value.split(":")[1];

                                setDate({
                                    from: new Date(subDays(new Date(), parseInt(startDate))),
                                    to: new Date(subDays(new Date(), parseInt(endDate)))
                                })
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a preset" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="0:0">Today</SelectItem>
                                <SelectItem value="1:1">Yesterday</SelectItem>
                                <SelectItem value="7:0">Last 7 Days</SelectItem>
                                <SelectItem value="30:0">Iast 30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
