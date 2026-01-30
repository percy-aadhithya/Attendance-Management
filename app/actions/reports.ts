'use server'

import { PrismaClient, Prisma } from '@prisma/client'

type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
    include: {
        student: {
            include: {
                location: true
            }
        }
        class: true
    }
}>
import { Parser } from 'json2csv'

const prisma = new PrismaClient()

export type ReportPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export async function getAttendanceData(period: ReportPeriod | string, classId: string, year?: number) {
    const today = new Date()
    let startDate = new Date()
    let endDate = new Date()

    if (period === 'WEEKLY') {
        startDate.setDate(today.getDate() - 7)
    } else if (period === 'MONTHLY') {
        startDate.setMonth(today.getMonth() - 1)
    } else if (period === 'YEARLY') {
        startDate.setFullYear(today.getFullYear() - 1)
    } else {
        // Assume period is a month name or index (0-11)
        // If it's a month index (0-11)
        const monthIndex = parseInt(period)
        if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
            const targetYear = year || today.getFullYear()
            startDate = new Date(targetYear, monthIndex, 1)
            endDate = new Date(targetYear, monthIndex + 1, 0) // Last day of month
            // Set endDate to end of day to be safe, though Prisma GTE/LTE typically works with dates
            endDate.setHours(23, 59, 59, 999)
        }
    }

    const whereClause: any = {
        date: {
            gte: startDate,
            lte: endDate > today && period !== 'WEEKLY' && period !== 'MONTHLY' && period !== 'YEARLY' ? endDate : today
        }
    }

    // If specific month, we want the whole month even if in future? No, probably up to today if current month?
    // But usually reports are for past data. If user selects a future month, it will be empty.
    // However, if user selects "January" and we are in "March", we want full January.
    // So the `lte: today` logic was for *relative* periods. For specific months, we should respect the month end.

    if (period !== 'WEEKLY' && period !== 'MONTHLY' && period !== 'YEARLY') {
        whereClause.date.lte = endDate
    }

    if (classId && classId !== 'ALL') {
        whereClause.classId = classId
    }

    const attendanceRecords = await prisma.attendance.findMany({
        where: whereClause,
        include: {
            student: {
                include: {
                    location: true
                }
            },
            class: true
        },
        orderBy: {
            date: 'desc'
        }
    })

    return attendanceRecords.map((record: AttendanceWithRelations) => ({
        date: record.date.toISOString().split('T')[0],
        studentName: record.student.name,
        status: record.status,
        className: record.class.name,
        location: record.student.location.name
    }))
}

export async function generateAttendanceReport(period: ReportPeriod | string, classId: string, year?: number) {
    const data = await getAttendanceData(period, classId, year)

    if (data.length === 0) {
        return null
    }

    const csvData = data.map((record: any) => ({
        Date: record.date,
        StudentName: record.studentName,
        Status: record.status,
        Class: record.className,
        Location: record.location
    }))

    const parser = new Parser()
    const csv = parser.parse(csvData)

    return csv
}
