'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const prisma = new PrismaClient()

const studentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    parentName: z.string().optional(),
    locationId: z.string().min(1, "Location is required"),
    classIds: z.array(z.string()).min(1, "Select at least one class"),
    admissionDate: z.string().optional(), // ISO string from form
})

export type StudentFormState = {
    errors?: {
        name?: string[]
        phone?: string[]
        parentName?: string[]
        locationId?: string[]
        classIds?: string[]
        _form?: string[]
    }
    message?: string
} | null

export async function createStudent(prevState: StudentFormState, formData: FormData): Promise<StudentFormState> {
    // Parse FormData manually since we have array inputs
    const rawData = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        parentName: formData.get('parentName') as string,
        locationId: formData.get('locationId') as string,
        classIds: formData.getAll('classIds') as string[],
        admissionDate: formData.get('admissionDate') as string,
    }

    const validatedFields = studentSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Student.',
        }
    }

    const { name, phone, parentName, locationId, classIds, admissionDate } = validatedFields.data

    try {
        await prisma.student.create({
            data: {
                name,
                phone: phone || null,
                parentName: parentName || null,
                locationId,
                admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
                enrollments: {
                    create: classIds.map((cid) => ({
                        classId: cid,
                    })),
                },
            },
        })
    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to Create Student.',
        }
    }

    revalidatePath('/students')
    redirect('/students')
}

export async function updateStudent(id: string, prevState: StudentFormState, formData: FormData): Promise<StudentFormState> {
    const rawData = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        parentName: formData.get('parentName') as string,
        locationId: formData.get('locationId') as string,
        classIds: formData.getAll('classIds') as string[],
        admissionDate: formData.get('admissionDate') as string,
    }

    const validatedFields = studentSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Student.',
        }
    }

    const { name, phone, parentName, locationId, classIds, admissionDate } = validatedFields.data

    try {
        // Transaction to update details and sync enrollments
        await prisma.$transaction(async (tx: any) => {
            // 1. Update basic details
            await tx.student.update({
                where: { id },
                data: {
                    name,
                    phone: phone || null,
                    parentName: parentName || null,
                    locationId,
                    admissionDate: admissionDate ? new Date(admissionDate) : undefined,
                }
            })

            // 2. Sync enrollments (delete missing, create new)
            // First get existing
            const existingEnrollments = await tx.enrollment.findMany({
                where: { studentId: id },
                select: { classId: true }
            })
            const existingIds = existingEnrollments.map((e: { classId: string }) => e.classId)

            const toAdd = classIds.filter((cid: string) => !existingIds.includes(cid))
            const toRemove = existingIds.filter((cid: string) => !classIds.includes(cid))

            if (toRemove.length > 0) {
                await tx.enrollment.deleteMany({
                    where: {
                        studentId: id,
                        classId: { in: toRemove }
                    }
                })
            }

            if (toAdd.length > 0) {
                await tx.enrollment.createMany({
                    data: toAdd.map((cid: string) => ({
                        studentId: id,
                        classId: cid
                    }))
                })
            }
        })

    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to Update Student.',
        }
    }

    revalidatePath('/students')
    revalidatePath(`/students/${id}`)
    redirect(`/students/${id}`)
}

export async function getLocations() {
    return await prisma.location.findMany()
}

export async function getClasses() {
    return await prisma.class.findMany()
}

export async function deleteStudent(id: string) {
    try {
        await prisma.student.delete({
            where: { id }
        })
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to delete student')
    }

    revalidatePath('/students')
    redirect('/students')
}

export async function getStudentForEdit(id: string) {
    return await prisma.student.findUnique({
        where: { id },
        include: {
            enrollments: true
        }
    })
}
