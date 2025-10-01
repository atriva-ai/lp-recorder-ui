"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Eye, Upload, RefreshCw } from "lucide-react"
import { FileUploadDialog } from "./file-upload-dialog"

interface Detection {
  id: number
  source_type: "camera" | "file"
  source_name: string
  plate_number: string
  confidence: number
  thumbnail_path?: string
  full_image_path?: string
  location?: string
  detected_at: string
  video_path?: string
  video_timestamp?: string
  start_time_offset?: string
}

export function DetectionSection() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [detections, setDetections] = useState<Detection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  // Fetch detections from API
  const fetchDetections = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        skip: ((currentPage - 1) * itemsPerPage).toString(),
        limit: itemsPerPage.toString(),
      })
      
      if (sourceFilter !== "all") {
        params.append("source_type", sourceFilter)
      }
      
      const response = await fetch(`/api/v1/license-plates?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDetections(data)
      } else {
        console.error("Failed to fetch detections")
        setDetections([])
      }
    } catch (error) {
      console.error("Error fetching detections:", error)
      setDetections([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetections()
  }, [currentPage, itemsPerPage, sourceFilter])

  const totalPages = Math.ceil(detections.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDetections = detections.slice(startIndex, endIndex)

  const handleUploadSuccess = () => {
    // Refresh detections after successful upload
    fetchDetections()
  }

  const getLocationDisplay = (detection: Detection) => {
    if (detection.source_type === "file") {
      return detection.location || "File Upload"
    }
    return detection.location || detection.source_name
  }

  const getSourceIcon = (sourceType: string) => {
    return sourceType === "file" ? "📁" : "📹"
  }

  return (
    <section>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-foreground">Detected License Plates</CardTitle>
            <div className="flex items-center space-x-2">
              <FileUploadDialog onUploadSuccess={handleUploadSuccess} />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDetections}
                disabled={isLoading}
                className="border-border text-foreground hover:bg-muted"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-muted-foreground">Source:</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-32 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="camera">Camera</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-muted-foreground">Per page:</label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Source</TableHead>
                  <TableHead className="text-muted-foreground">Location</TableHead>
                  <TableHead className="text-muted-foreground">Date/Time</TableHead>
                  <TableHead className="text-muted-foreground">License Plate Number</TableHead>
                  <TableHead className="text-muted-foreground">Confidence</TableHead>
                  <TableHead className="text-muted-foreground">Plate Snapshot</TableHead>
                  <TableHead className="text-muted-foreground">Full Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading detections...
                    </TableCell>
                  </TableRow>
                ) : currentDetections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No detections found. Upload a video file or check camera feeds.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentDetections.map((detection) => (
                    <TableRow key={detection.id} className="border-border">
                      <TableCell className="text-foreground">
                        <div className="flex items-center space-x-1">
                          <span>{getSourceIcon(detection.source_type)}</span>
                          <span className="text-xs">{detection.source_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{getLocationDisplay(detection)}</TableCell>
                      <TableCell className="text-foreground font-mono text-sm">
                        {new Date(detection.detected_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false
                        })}
                      </TableCell>
                      <TableCell className="font-bold text-blue-500">{detection.plate_number}</TableCell>
                      <TableCell className="text-foreground">
                        <span className={`px-2 py-1 rounded text-xs ${
                          detection.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                          detection.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <img
                          src={detection.thumbnail_path || "/placeholder.svg"}
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
                              <DialogTitle className="text-foreground">
                                Full Image - {detection.plate_number}
                                {detection.source_type === "file" && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    From: {detection.source_name}
                                    {detection.video_timestamp && ` (${detection.video_timestamp})`}
                                  </div>
                                )}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img
                                src={detection.full_image_path || "/placeholder.svg"}
                                alt="Full detection image"
                                className="max-w-full h-auto rounded border border-border"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, detections.length)} of {detections.length} detections
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

// No mock data - only show real detections