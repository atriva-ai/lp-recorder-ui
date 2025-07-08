"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Camera {
  id: string
  position: "Front" | "Back" | "Left" | "Right"
  isActive: boolean
  cameraDevice?: string
  rtspUrl?: string
  aiRecognitionEnabled?: boolean
}

interface CameraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  camera?: Camera | null
  onSave: (cameraData: Partial<Camera>) => void
  usedPositions: string[]
  availableCameras: string[]
}

export function CameraDialog({
  open,
  onOpenChange,
  camera,
  onSave,
  usedPositions,
  availableCameras,
}: CameraDialogProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [rtspUrl, setRtspUrl] = useState<string>("")
  const [aiRecognitionEnabled, setAiRecognitionEnabled] = useState<boolean>(true)

  const positions = ["Front", "Back", "Left", "Right"]
  const availablePositions = positions.filter((pos) => !usedPositions.includes(pos) || pos === camera?.position)

  // Filter out cameras that are already assigned to other positions
  const unassignedCameras = availableCameras.filter((cam) => {
    // If editing, allow the current camera to be selected
    if (camera && camera.cameraDevice === cam) return true
    // Otherwise, only show cameras not assigned to any position
    return !availableCameras.some((assignedCam) => assignedCam === cam && assignedCam !== camera?.cameraDevice)
  })

  useEffect(() => {
    if (camera) {
      // Editing existing camera
      setSelectedPosition(camera.position)
      setSelectedCamera(camera.cameraDevice || "")
      setRtspUrl(camera.rtspUrl || "")
      setAiRecognitionEnabled(camera.aiRecognitionEnabled ?? true)
    } else {
      // Adding new camera
      setSelectedPosition("")
      setSelectedCamera("")
      setRtspUrl("")
      setAiRecognitionEnabled(true)
    }
  }, [camera, open])

  const handleSave = () => {
    if (!selectedPosition || !selectedCamera) return

    const cameraData: Partial<Camera> = {
      position: selectedPosition as Camera["position"],
      cameraDevice: selectedCamera,
      rtspUrl: rtspUrl.trim() || undefined,
      aiRecognitionEnabled,
      isActive: true,
    }

    onSave(cameraData)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{camera ? "Edit Camera" : "Add Camera"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Position Selection */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium text-foreground">
              Camera Position
            </Label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {availablePositions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Camera Device Selection */}
          <div className="space-y-2">
            <Label htmlFor="camera" className="text-sm font-medium text-foreground">
              Camera Device
            </Label>
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select camera device" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {unassignedCameras.map((cameraDevice) => (
                  <SelectItem key={cameraDevice} value={cameraDevice}>
                    {cameraDevice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RTSP URL Input */}
          <div className="space-y-2">
            <Label htmlFor="rtsp" className="text-sm font-medium text-foreground">
              RTSP Stream URL
            </Label>
            <Input
              id="rtsp"
              type="url"
              placeholder="rtsp://username:password@ip:port/stream"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">Optional: Enter RTSP stream URL for live video feed</p>
          </div>

          {/* AI Recognition Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ai-recognition" className="text-sm font-medium text-foreground">
                AI License Plate Recognition
              </Label>
              <p className="text-xs text-muted-foreground">Enable automatic license plate detection</p>
            </div>
            <Switch id="ai-recognition" checked={aiRecognitionEnabled} onCheckedChange={setAiRecognitionEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedPosition || !selectedCamera}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {camera ? "Update Camera" : "Add Camera"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
