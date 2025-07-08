"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye } from "lucide-react"

interface RepeatedPlate {
  plateNumber: string
  count: number
  detections: {
    id: string
    location: "Front" | "Back" | "Left" | "Right"
    dateTime: string
    thumbnail: string
    fullImage: string
  }[]
}

const mockRepeatedPlates: Record<string, RepeatedPlate[]> = {
  "1": [
    {
      plateNumber: "ABC123",
      count: 3,
      detections: [
        {
          id: "1",
          location: "Front",
          dateTime: "2024-01-07 14:30:25",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
        {
          id: "2",
          location: "Back",
          dateTime: "2024-01-07 12:15:10",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
        {
          id: "3",
          location: "Front",
          dateTime: "2024-01-07 09:45:30",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
      ],
    },
    {
      plateNumber: "XYZ789",
      count: 2,
      detections: [
        {
          id: "4",
          location: "Left",
          dateTime: "2024-01-07 16:20:15",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
        {
          id: "5",
          location: "Right",
          dateTime: "2024-01-07 11:30:45",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
      ],
    },
  ],
  "3": [
    {
      plateNumber: "ABC123",
      count: 5,
      detections: [
        {
          id: "6",
          location: "Front",
          dateTime: "2024-01-07 14:30:25",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
        {
          id: "7",
          location: "Back",
          dateTime: "2024-01-06 18:15:10",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
        {
          id: "8",
          location: "Front",
          dateTime: "2024-01-05 09:45:30",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
      ],
    },
  ],
  "7": [
    {
      plateNumber: "ABC123",
      count: 8,
      detections: [
        {
          id: "9",
          location: "Front",
          dateTime: "2024-01-07 14:30:25",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
        {
          id: "10",
          location: "Back",
          dateTime: "2024-01-03 12:15:10",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
        {
          id: "11",
          location: "Left",
          dateTime: "2024-01-01 16:45:30",
          thumbnail: "/placeholder.svg?height=40&width=60",
          fullImage: "/placeholder.svg?height=400&width=600",
        },
      ],
    },
  ],
}

export function RepeatedPlatesSection() {
  const [timeframe, setTimeframe] = useState("1")
  const [expandedPlate, setExpandedPlate] = useState<string | null>(null)

  const repeatedPlates = mockRepeatedPlates[timeframe] || []

  const toggleExpanded = (plateNumber: string) => {
    setExpandedPlate(expandedPlate === plateNumber ? null : plateNumber)
  }

  return (
    <section>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Repeated License Plates</CardTitle>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {repeatedPlates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No repeated license plates found in the selected timeframe.
            </div>
          ) : (
            <div className="space-y-2">
              {repeatedPlates.map((plate) => (
                <Collapsible
                  key={plate.plateNumber}
                  open={expandedPlate === plate.plateNumber}
                  onOpenChange={() => toggleExpanded(plate.plateNumber)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto bg-muted hover:bg-muted/80 border border-border"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-blue-500 text-lg">{plate.plateNumber}</span>
                        <span className="text-foreground">Detected {plate.count} times</span>
                      </div>
                      {expandedPlate === plate.plateNumber ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-2">
                    <div className="bg-muted/50 rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead className="text-muted-foreground">Location</TableHead>
                            <TableHead className="text-muted-foreground">Date/Time</TableHead>
                            <TableHead className="text-muted-foreground">License Plate Number</TableHead>
                            <TableHead className="text-muted-foreground">Plate Snapshot</TableHead>
                            <TableHead className="text-muted-foreground">Full Image</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plate.detections.map((detection) => (
                            <TableRow key={detection.id} className="border-border">
                              <TableCell className="text-foreground">{detection.location}</TableCell>
                              <TableCell className="text-foreground font-mono text-sm">{detection.dateTime}</TableCell>
                              <TableCell className="font-bold text-blue-500">{plate.plateNumber}</TableCell>
                              <TableCell>
                                <img
                                  src={detection.thumbnail || "/placeholder.svg"}
                                  alt="Detection thumbnail"
                                  className="w-15 h-10 object-cover rounded border border-border"
                                />
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-card border-border max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-foreground">
                                        Full Image - {plate.plateNumber}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="flex justify-center">
                                      <img
                                        src={detection.fullImage || "/placeholder.svg"}
                                        alt="Full detection image"
                                        className="max-w-full h-auto rounded border border-border"
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
