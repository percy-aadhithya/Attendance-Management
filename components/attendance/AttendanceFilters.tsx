"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"

type FilterProps = {
    classes: { id: string; name: string }[]
    locations: { id: string; name: string }[]
}

export function AttendanceFilters({ classes, locations }: FilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [date, setDate] = useState<Date | undefined>(
        searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date()
    )

    const currentClassId = searchParams.get("classId") || (classes.length > 0 ? classes[0].id : "")
    const currentLocationId = searchParams.get("locationId") || (locations.length > 0 ? locations[0].id : "")

    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`/attendance?${params.toString()}`)
    }

    // Effect to set initial defaults in URL if missing
    useEffect(() => {
        let needsUpdate = false
        const params = new URLSearchParams(searchParams.toString())

        if (!params.get("date")) {
            params.set("date", new Date().toISOString().split('T')[0])
            needsUpdate = true
        }
        if (!params.get("classId") && classes.length > 0) {
            params.set("classId", classes[0].id)
            needsUpdate = true
        }
        if (!params.get("locationId") && locations.length > 0) {
            params.set("locationId", locations[0].id)
            needsUpdate = true
        }

        if (needsUpdate) {
            router.replace(`/attendance?${params.toString()}`)
        }
    }, [classes, locations, searchParams, router])


    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                                setDate(d)
                                if (d) updateParams("date", format(d, 'yyyy-MM-dd')) // Use simple date format
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex-1">
                <Select
                    value={currentLocationId}
                    onValueChange={(val) => updateParams("locationId", val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1">
                <Select
                    value={currentClassId}
                    onValueChange={(val) => updateParams("classId", val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
