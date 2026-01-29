'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getDashboardStats() {
    const [
        totalStudents,
        locations,
        classes
    ] = await Promise.all([
        prisma.student.count(),
        prisma.location.findMany({
            include: {
                _count: {
                    select: { students: true }
                }
            }
        }),
        prisma.class.findMany({
            include: {
                _count: {
                    select: { enrollments: true }
                }
            }
        })
    ])

    // Today's attendance
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const attendanceCount = await prisma.attendance.count({
        where: {
            date: {
                gte: startOfDay
            },
            status: 'PRESENT'
        }
    })

    return {
        totalStudents,
        locations,
        classes,
        attendanceCount
    }
}
