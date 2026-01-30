import { getFees } from "@/app/actions/fees"
import { FeeList } from "@/components/fees/FeeList"

export const dynamic = 'force-dynamic'

export default async function FeesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'ALL'

    const students = await getFees(statusFilter)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Fee Management</h1>
                <div className="text-sm text-muted-foreground"> Current Period: {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}</div>
            </div>

            <FeeList initialData={students} />
        </div>
    )
}
