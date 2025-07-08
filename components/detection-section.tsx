"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface Detection {
  id: string
  location: "Front" | "Back" | "Left" | "Right"
  dateTime: string
  plateNumber: string
  thumbnail: string
  fullImage: string
}

const mockDetections: Detection[] = [
  {
    id: "1",
    location: "Front",
    dateTime: "2024-01-07 14:30:25",
    plateNumber: "ABC123",
    thumbnail: "/placeholder.svg?height=40&width=60",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    location: "Back",
    dateTime: "2024-01-07 14:28:15",
    plateNumber: "XYZ789",
    thumbnail: "/placeholder.svg?height=40&width=60",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "3",
    location: "Left",
    dateTime: "2024-01-07 14:25:10",
    plateNumber: "DEF456",
    thumbnail: "/placeholder.svg?height=40&width=60",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "4",
    location: "Right",
    dateTime: "2024-01-07 14:22:05",
    plateNumber: "GHI789",
    thumbnail: "/placeholder.svg?height=40&width=60",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "5",
    location: "Front",
    dateTime: "2024-01-07 14:20:30",
    plateNumber: "JKL012",
    thumbnail: "/placeholder.svg?height=40&width=60",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
]

export function DetectionSection() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const totalPages = Math.ceil(mockDetections.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDetections = mockDetections.slice(startIndex, endIndex)

  return (
    <section>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Detected License Plates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {currentDetections.map((detection) => (
                  <TableRow key={detection.id} className="border-border">
                    <TableCell className="text-foreground">{detection.location}</TableCell>
                    <TableCell className="text-foreground font-mono text-sm">{detection.dateTime}</TableCell>
                    <TableCell className="font-bold text-blue-500">{detection.plateNumber}</TableCell>
                    <TableCell>
                      <img
                        src={detection.thumbnail || "/placeholder.svg"}
                        alt="Plate thumbnail"
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
                            <DialogTitle className="text-foreground">Full Image - {detection.plateNumber}</DialogTitle>
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

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-20 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
