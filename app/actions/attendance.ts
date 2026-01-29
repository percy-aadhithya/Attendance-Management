'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getAttendance(date: Date, classId: string, locationId: string) {
    // Get all students enrolled in this class at this location
    // AND include their attendance for the specific date if it exists

    // We need to query students who have an enrollment in the class AND fit the location
    // Then join with attendance

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const students = await prisma.student.findMany({
        where: {
            locationId: locationId,
            enrollments: {
                some: {
                    classId: classId
                }
            }
        },
        include: {
            attendance: {
                where: {
                    classId: classId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                take: 1
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    return students
}

export async function markAttendance(
    studentId: string,
    classId: string,
    date: Date,
    status: 'PRESENT' | 'ABSENT'
) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Upsert attendance record
    // We need to find if one exists for this day

    // Since we can't easily upsert based on a date range in standard unique constraints without composite key on exact date, 
    // and our date in DB might include time, we should handle this carefully.
    // The schema has @@unique([date, studentId, classId]). 
    // If we store date as strict midnight UTC or similar, we can rely on unique constraint.
    // Let's normalize the date to midnight.

    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    await prisma.attendance.upsert({
        where: {
            date_studentId_classId: {
                studentId,
                classId,
                date: normalizedDate
            }
        },
        update: {
            status,
        },
        create: {
            studentId,
            classId,
            date: normalizedDate,
            status,
        }
    })

    revalidatePath('/attendance')
}
