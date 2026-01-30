'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { generateAttendanceReport, getAttendanceData } from "@/app/actions/reports"
import { Loader2, Download } from "lucide-react"

type ReportsClientProps = {
    classes: { id: string; name: string }[]
}

export function ReportsClient({ classes }: ReportsClientProps) {
    const [reportType, setReportType] = useState<'PRESET' | 'MONTHLY'>('PRESET')
    const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('WEEKLY')
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())
    const [classId, setClassId] = useState<string>('ALL')
    const [loading, setLoading] = useState(false)
    const [reportData, setReportData] = useState<any[] | null>(null)

    const handleView = async () => {
        try {
            setLoading(true)
            const periodParam = reportType === 'PRESET' ? period : selectedMonth
            const data = await getAttendanceData(periodParam, classId)
            setReportData(data)
        } catch (error) {
            console.error(error)
            alert("Failed to fetch report data")
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        try {
            setLoading(true)
            const periodParam = reportType === 'PRESET' ? period : selectedMonth
            const csvData = await generateAttendanceReport(periodParam, classId)

            if (!csvData) {
                alert("No data found for the selected range.")
                return
            }

            // Create a blob and trigger download
            const blob = new Blob([csvData], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `attendance_report_${reportType === 'PRESET' ? period.toLowerCase() : `month_${selectedMonth}`}_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error(error)
            alert("Failed to download report")
        } finally {
            setLoading(false)
        }
    }

    const months = [
        { value: '0', label: 'January' },
        { value: '1', label: 'February' },
        { value: '2', label: 'March' },
        { value: '3', label: 'April' },
        { value: '4', label: 'May' },
        { value: '5', label: 'June' },
        { value: '6', label: 'July' },
        { value: '7', label: 'August' },
        { value: '8', label: 'September' },
        { value: '9', label: 'October' },
        { value: '10', label: 'November' },
        { value: '11', label: 'December' },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>View or download attendance records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Report Type</label>
                        <Select value={reportType} onValueChange={(v: 'PRESET' | 'MONTHLY') => setReportType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PRESET">Preset Range</SelectItem>
                                <SelectItem value="MONTHLY">Specific Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {reportType === 'PRESET' ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time Period</label>
                            <Select value={period} onValueChange={(v: 'WEEKLY' | 'MONTHLY' | 'YEARLY') => setPeriod(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEKLY">Last 7 Days</SelectItem>
                                    <SelectItem value="MONTHLY">Last 30 Days</SelectItem>
                                    <SelectItem value="YEARLY">Last 1 Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Month</label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Class Filter</label>
                        <Select value={classId} onValueChange={setClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Classes</SelectItem>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
                    <Button onClick={handleView} disabled={loading} variant="outline" className="w-full md:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        View Report
                    </Button>
                    <Button onClick={handleDownload} disabled={loading} className="w-full md:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download CSV
                    </Button>
                </div>

                {reportData && (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No records found</TableCell>
                                    </TableRow>
                                ) : (
                                    reportData.map((record, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{record.date}</TableCell>
                                            <TableCell>{record.studentName}</TableCell>
                                            <TableCell>{record.status}</TableCell>
                                            <TableCell>{record.className}</TableCell>
                                            <TableCell>{record.location}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
