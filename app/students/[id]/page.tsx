import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarCheck, Banknote, User } from "lucide-react"
import { DeleteStudentButton } from "@/components/students/DeleteStudentButton"

const prisma = new PrismaClient()

async function getStudent(id: string) {
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            location: true,
            enrollments: {
                include: { class: true }
            },
            attendance: {
                orderBy: { date: 'desc' },
                include: { class: true },
                take: 50 // Last 50 records
            },
            fees: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })
    return student
}

export const dynamic = 'force-dynamic'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const student = await getStudent(resolvedParams.id)

    if (!student) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">{student.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {student.id.slice(0, 8)}...</span>
                        <span>•</span>
                        <span>{student.location.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/students/${student.id}/edit`}>
                        <Button variant="outline">Edit Student</Button>
                    </Link>
                    <DeleteStudentButton id={student.id} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Admission Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{student.admissionDate.toLocaleDateString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1">
                            {student.enrollments.map((e: any) => (
                                <Badge key={e.classId} variant="secondary">{e.class.name}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Fees Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {student.fees.length > 0 && student.fees[0].status === 'PAID' ?
                            <Badge className="bg-green-500">Paid Current</Badge> :
                            <Badge variant="destructive">Pending</Badge>
                        }
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="attendance" className="w-full">
                <TabsList>
                    <TabsTrigger value="attendance">Attendance History</TabsTrigger>
                    <TabsTrigger value="fees">Fee History</TabsTrigger>
                </TabsList>
                <TabsContent value="attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Records</CardTitle>
                            <CardDescription>Recent attendance for all enrolled classes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {student.attendance.length === 0 ? "No records found." :
                                    student.attendance.map((a: any) => (
                                        <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{a.date.toLocaleDateString()}</p>
                                                    <p className="text-xs text-muted-foreground">{a.class.name}</p>
                                                </div>
                                            </div>
                                            <Badge variant={a.status === 'PRESENT' ? 'default' : 'secondary'}>
                                                {a.status}
                                            </Badge>
                                        </div>
                                    ))
                                }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="fees">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {student.fees.length === 0 ? "No payment records found." :
                                    student.fees.map((f: any) => (
                                        <div key={f.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <Banknote className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{f.period}</p>
                                                    <p className="text-xs text-muted-foreground">{f.paymentDate ? f.paymentDate.toLocaleDateString() : 'Not Paid'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{f.amount ? `₹${f.amount}` : '-'}</div>
                                                <Badge variant={f.status === 'PAID' ? 'outline' : 'destructive'} className={f.status === 'PAID' ? "text-green-600 border-green-600" : ""}>
                                                    {f.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
