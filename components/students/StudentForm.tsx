"use client"

import { useActionState, useState, useEffect } from "react"
import { createStudent, updateStudent, StudentFormState } from "@/app/actions/students"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Location = {
    id: string
    name: string
}

type ClassItem = {
    id: string
    name: string
}

type InitialData = {
    id: string
    name: string
    phone: string | null
    parentName: string | null
    locationId: string
    admissionDate: Date
    enrollments: { classId: string }[]
}

export function StudentForm({
    locations,
    classes,
    initialData
}: {
    locations: Location[],
    classes: ClassItem[],
    initialData?: InitialData
}) {
    const updateAction = initialData
        ? updateStudent.bind(null, initialData.id)
        : createStudent

    const [state, formAction] = useActionState(updateAction, null)

    // Logic for default values
    const defaultClassIds = initialData?.enrollments.map(e => e.classId) || []

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Student Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Enter student name"
                            defaultValue={initialData?.name}
                            required
                        />
                        {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Phone number"
                            defaultValue={initialData?.phone || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="parentName">Parent / Guardian Name</Label>
                        <Input
                            id="parentName"
                            name="parentName"
                            placeholder="Parent name"
                            defaultValue={initialData?.parentName || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Select name="locationId" required defaultValue={initialData?.locationId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state?.errors?.locationId && <p className="text-sm text-red-500">{state.errors.locationId[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Classes</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-4">
                            {classes.map((cls) => (
                                <div key={cls.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="classIds"
                                        value={cls.id}
                                        id={`class-${cls.id}`}
                                        defaultChecked={defaultClassIds.includes(cls.id)}
                                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                    <Label htmlFor={`class-${cls.id}`} className="font-normal cursor-pointer">
                                        {cls.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {state?.errors?.classIds && <p className="text-sm text-red-500">{state.errors.classIds[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admissionDate">Admission Date</Label>
                        <Input
                            id="admissionDate"
                            name="admissionDate"
                            type="date"
                            defaultValue={initialData?.admissionDate ? new Date(initialData.admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full">
                            {initialData ? "Update Student" : "Save Student"}
                        </Button>
                    </div>

                    {state?.message && (
                        <p className="text-sm font-medium text-red-500">{state.message}</p>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
