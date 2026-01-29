'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getFees(statusFilter?: string) {
    // Get all students and their latest fee status
    // Ideally, we want to see if they have paid for the CURRENT month.
    // For simplicity, let's just show the list of all students and their most recent fee record.

    const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM

    const students = await prisma.student.findMany({
        include: {
            location: true,
            fees: {
                where: {
                    period: currentPeriod
                },
                take: 1
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    // Normalize data for UI
    const feeData = students.map(student => {
        const feeRecord = student.fees[0]
        return {
            studentId: student.id,
            studentName: student.name,
            locationName: student.location.name,
            status: feeRecord ? feeRecord.status : 'UNPAID',
            amount: feeRecord ? feeRecord.amount : null,
            lastPaymentDate: feeRecord ? feeRecord.paymentDate : null,
            feeId: feeRecord ? feeRecord.id : null
        }
    })

    if (statusFilter && statusFilter !== 'ALL') {
        return feeData.filter(f => f.status === statusFilter)
    }

    return feeData
}

export async function recordPayment(studentId: string, amount: number) {
    const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM

    // Create or Update fee record for this month
    // Since we want to track history, usually we create a new record per month.
    // For this simplified app, we assume one fee record per period.

    // First check if record exists
    const existing = await prisma.fee.findFirst({
        where: {
            studentId,
            period: currentPeriod
        }
    })

    if (existing) {
        await prisma.fee.update({
            where: { id: existing.id },
            data: {
                status: 'PAID',
                amount: amount,
                paymentDate: new Date()
            }
        })
    } else {
        await prisma.fee.create({
            data: {
                studentId,
                period: currentPeriod,
                status: 'PAID',
                amount: amount,
                paymentDate: new Date()
            }
        })
    }

    revalidatePath('/fees')
}
