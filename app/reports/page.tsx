import { getClasses } from "@/app/actions/students"
import { ReportsClient } from "@/components/reports/ReportsClient"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const classes = await getClasses()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            </div>

            <ReportsClient classes={classes} />
        </div>
    )
}
