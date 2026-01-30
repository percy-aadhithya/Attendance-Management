"use client"

import { markAttendance } from "@/app/actions/attendance"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

type StudentWithAttendance = {
    id: string
    name: string
    attendance: {
        status: string
    }[]
}

export function AttendanceList({
    students,
    classId,
    date
}: {
    students: StudentWithAttendance[]
    classId: string
    date: string
}) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = (studentId: string, currentStatus: boolean) => {
        const newStatus = currentStatus ? "ABSENT" : "PRESENT"
        // Optimistic UI could happen here, but standard transition is okay for now
        startTransition(async () => {
            await markAttendance(studentId, classId, new Date(date), newStatus)
        })
    }

    return (
        <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] whitespace-nowrap">Status</TableHead>
                            <TableHead className="whitespace-nowrap">Student Name</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No students enrolled in this class at this location.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => {
                                const isPresent = student.attendance.length > 0 && student.attendance[0].status === "PRESENT"
                                return (
                                    <TableRow key={student.id} className={cn(isPresent ? "bg-muted/50" : "")}>
                                        <TableCell>
                                            <div className={cn(
                                                "h-3 w-3 rounded-full",
                                                isPresent ? "bg-green-500" : "bg-gray-300"
                                            )} />
                                        </TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {student.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ButtonTag
                                                isPresent={isPresent}
                                                onClick={() => handleToggle(student.id, isPresent)}
                                                disabled={isPending}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function ButtonTag({ isPresent, onClick, disabled }: { isPresent: boolean, onClick: () => void, disabled: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all border whitespace-nowrap",
                isPresent
                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            )}
        >
            <span className="sm:hidden">{isPresent ? "Present" : "Mark"}</span>
            <span className="hidden sm:inline">{isPresent ? "Present" : "Mark Present"}</span>
        </button>
    )
}
