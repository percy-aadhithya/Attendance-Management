"use client"

import { useState, useTransition } from "react"
import { recordPayment } from "@/app/actions/fees"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FeeRecord = {
    studentId: string
    studentName: string
    locationName: string
    status: string
    amount: number | null
    lastPaymentDate: Date | null
    feeId: string | null
}

export function FeeList({ initialData }: { initialData: FeeRecord[] }) {
    const [filter, setFilter] = useState('ALL') // We can filter locally for speed given reduced payload size

    const filteredData = filter === 'ALL' ? initialData : initialData.filter(d => d.status === filter)

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {['ALL', 'PAID', 'UNPAID'].map(f => (
                    <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        onClick={() => setFilter(f)}
                        size="sm"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="hidden md:table-cell">Location</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((record) => (
                            <FeeRow key={record.studentId} record={record} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function FeeRow({ record }: { record: FeeRecord }) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [amount, setAmount] = useState<string>("500") // Default amount

    const handlePayment = () => {
        startTransition(async () => {
            await recordPayment(record.studentId, parseFloat(amount))
            setIsOpen(false)
        })
    }

    const isPaid = record.status === 'PAID'

    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span>{record.studentName}</span>
                    <span className="text-xs text-muted-foreground md:hidden">{record.locationName}</span>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{record.locationName}</TableCell>
            <TableCell>
                {record.amount ? `₹${record.amount}` : '-'}
            </TableCell>
            <TableCell>
                <Badge variant={isPaid ? "default" : "destructive"}>
                    {record.status}
                </Badge>
                {isPaid && record.lastPaymentDate && (
                    <div className="text-xs text-muted-foreground mt-1">
                        {new Date(record.lastPaymentDate).toLocaleDateString()}
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right">
                {!isPaid && (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Mark Paid</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Record Payment</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">
                                        Amount
                                    </Label>
                                    <Input
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="col-span-3"
                                        type="number"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handlePayment} disabled={isPending}>
                                    {isPending ? "Saving..." : "Confirm Payment"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </TableCell>
        </TableRow>
    )
}
