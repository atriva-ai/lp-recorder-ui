"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye } from "lucide-react"

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

interface RepeatedPlate {
  plate_number: string
  count: number
  detections: Detection[]
}

export function RepeatedPlatesSection() {
  const [timeframe, setTimeframe] = useState("1")
  const [repeatedPlates, setRepeatedPlates] = useState<RepeatedPlate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openPlates, setOpenPlates] = useState<Set<string>>(new Set())

  // Fetch repeated plates from API
  const fetchRepeatedPlates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/v1/license-plates/repeated/${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setRepeatedPlates(data)
      } else {
        console.error("Failed to fetch repeated plates")
        setRepeatedPlates([])
      }
    } catch (error) {
      console.error("Error fetching repeated plates:", error)
      setRepeatedPlates([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRepeatedPlates()
  }, [timeframe])

  const togglePlate = (plateNumber: string) => {
    const newOpenPlates = new Set(openPlates)
    if (newOpenPlates.has(plateNumber)) {
      newOpenPlates.delete(plateNumber)
    } else {
      newOpenPlates.add(plateNumber)
    }
    setOpenPlates(newOpenPlates)
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
            <CardTitle className="text-foreground">Repeated License Plates</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRepeatedPlates}
                disabled={isLoading}
                className="border-border text-foreground hover:bg-muted"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-muted-foreground">Timeframe:</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading repeated plates...
            </div>
          ) : repeatedPlates.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No repeated license plates found in the selected timeframe.
            </div>
          ) : (
            <div className="space-y-2">
              {repeatedPlates.map((plate) => (
                <Collapsible
                  key={plate.plate_number}
                  open={openPlates.has(plate.plate_number)}
                  onOpenChange={() => togglePlate(plate.plate_number)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto bg-muted/50 hover:bg-muted border border-border"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-blue-500 text-lg">
                          {plate.plate_number}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({plate.count} detections)
                        </span>
                      </div>
                      {openPlates.has(plate.plate_number) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead className="text-muted-foreground">Source</TableHead>
                            <TableHead className="text-muted-foreground">Location</TableHead>
                            <TableHead className="text-muted-foreground">Date/Time</TableHead>
                            <TableHead className="text-muted-foreground">License Plate</TableHead>
                            <TableHead className="text-muted-foreground">Confidence</TableHead>
                            <TableHead className="text-muted-foreground">Thumbnail</TableHead>
                            <TableHead className="text-muted-foreground">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plate.detections.map((detection) => (
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
                              <TableCell className="font-bold text-blue-500">{plate.plate_number}</TableCell>
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
                                        Full Image - {plate.plate_number}
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

// No mock data - only show real repeated plates