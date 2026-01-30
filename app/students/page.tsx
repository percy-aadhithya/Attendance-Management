import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { DeleteStudentButton } from "@/components/students/DeleteStudentButton"
import Link from "next/link"
import { PrismaClient } from "@prisma/client"

// Initialize Prisma Client
// In a real app, use a singleton pattern for PrismaClient to avoid multiple instances in dev
const prisma = new PrismaClient()

async function getStudents(query?: string) {
    const where = query ? {
        OR: [
            { name: { contains: query } },
            { location: { name: { contains: query } } }
        ]
    } : {}

    return await prisma.student.findMany({
        where,
        include: {
            location: true,
            enrollments: {
                include: {
                    class: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export const dynamic = 'force-dynamic'

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams
    const query = resolvedSearchParams?.query || ''
    const students = await getStudents(query)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Students</h1>
                <Link href="/students/new">
                    <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Add Student</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <SearchInput placeholder="Search students..." />
                {/* Location Filter can go here */}
            </div>

            <Card>
                <CardHeader className="px-4 py-4 md:px-6">
                    <CardTitle>All Students</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] pl-4 sm:pl-6">Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="hidden md:table-cell">Classes</TableHead>
                                    <TableHead className="hidden md:table-cell">Admission Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student: any) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium pl-4 sm:pl-6">
                                                <div className="flex flex-col">
                                                    <Link href={`/students/${student.id}`} className="hover:underline">
                                                        {student.name}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground md:hidden">
                                                        {student.location.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {student.location.name}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {student.enrollments.map((e: any) => (
                                                        <span key={e.class.id} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                            {e.class.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {student.admissionDate.toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/students/${student.id}/edit`}>
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </Link>
                                                    <DeleteStudentButton id={student.id} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
