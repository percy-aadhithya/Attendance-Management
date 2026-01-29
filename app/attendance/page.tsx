import { getClasses, getLocations } from "@/app/actions/students"
import { getAttendance } from "@/app/actions/attendance"
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters"
import { AttendanceList } from "@/components/attendance/AttendanceList"

export default async function AttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const locations = await getLocations()
    const classes = await getClasses()

    const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : new Date().toISOString().split('T')[0]
    const classIdParam = typeof resolvedSearchParams.classId === 'string' ? resolvedSearchParams.classId : (classes[0]?.id || "")
    const locationIdParam = typeof resolvedSearchParams.locationId === 'string' ? resolvedSearchParams.locationId : (locations[0]?.id || "")

    let students: any[] = []
    if (classIdParam && locationIdParam) {
        students = await getAttendance(new Date(dateParam), classIdParam, locationIdParam)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Daily Attendance</h1>
            </div>

            <AttendanceFilters
                classes={classes}
                locations={locations}
            />

            {(classIdParam && locationIdParam) ? (
                <AttendanceList
                    students={students}
                    classId={classIdParam}
                    date={dateParam}
                />
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    Please select valid class and location.
                </div>
            )}
        </div>
    )
}
