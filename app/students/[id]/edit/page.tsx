import { getLocations, getClasses, getStudentForEdit } from '@/app/actions/students'
import { StudentForm } from '@/components/students/StudentForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const [locations, classes, student] = await Promise.all([
        getLocations(),
        getClasses(),
        getStudentForEdit(resolvedParams.id)
    ])

    if (!student) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Edit Student</h1>
            </div>
            <div className="max-w-xl">
                <StudentForm
                    locations={locations}
                    classes={classes}
                    initialData={student}
                />
            </div>
        </div>
    )
}
