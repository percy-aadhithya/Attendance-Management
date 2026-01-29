import { getLocations, getClasses } from '@/app/actions/students'
import { StudentForm } from '@/components/students/StudentForm'

export const dynamic = 'force-dynamic'

export default async function AddStudentPage() {
    const [locations, classes] = await Promise.all([
        getLocations(),
        getClasses()
    ])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Add New Student</h1>
            </div>
            <div className="max-w-xl">
                <StudentForm locations={locations} classes={classes} />
            </div>
        </div>
    )
}
