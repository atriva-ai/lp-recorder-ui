"use client"

import React, { useState, useEffect, type ChangeEvent } from "react"
import type { JSX } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Camera {
  id: number
  name: string
  rtsp_url: string
  location?: string
  is_active: boolean
  video_info?: any
  vehicle_tracking_enabled?: boolean
}

interface CameraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  camera?: Camera | null
  onSave: (cameraData: Partial<Camera>) => void
}

export function CameraDialog({
  open,
  onOpenChange,
  camera,
  onSave,
}: CameraDialogProps) {
  const [name, setName] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [rtspUrl, setRtspUrl] = useState<string>("")
  const [isActive, setIsActive] = useState<boolean>(true)
  const [aiRecognitionEnabled, setAiRecognitionEnabled] = useState<boolean>(false)
  const [vehicleTrackingEnabled, setVehicleTrackingEnabled] = useState<boolean>(false)


  useEffect(() => {
    if (camera) {
      setName(camera.name || "")
      setLocation(camera.location || "")
      setRtspUrl(camera.rtsp_url || "")
      setIsActive(camera.is_active ?? true)
      setAiRecognitionEnabled(false) // Always false for now (grayed out)
      setVehicleTrackingEnabled(camera.vehicle_tracking_enabled ?? false)
    } else {
      setName("")
      setLocation("")
      setRtspUrl("")
      setIsActive(true)
      setAiRecognitionEnabled(false)
      setVehicleTrackingEnabled(false)
    }
  }, [camera, open])

  const handleSave = () => {
    if (!name.trim() || !rtspUrl.trim()) {
      console.log("Validation failed:", { name: name.trim(), rtspUrl: rtspUrl.trim() })
      return
    }
    const cameraData = {
      name: name.trim(),
      location: location || undefined,
      rtsp_url: rtspUrl.trim(),
      is_active: isActive,
      vehicle_tracking_enabled: vehicleTrackingEnabled,
    }
    console.log("Saving camera data:", cameraData)
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
          {/* Camera Name Input - Required */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Camera Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter camera name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="bg-background border-border text-foreground"
              required
            />
          </div>
          
          {/* Camera Location Input - Optional */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-foreground">
              Camera Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Enter camera location (optional)"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
          
          {/* RTSP URL Input - Required */}
          <div className="space-y-2">
            <Label htmlFor="rtsp" className="text-sm font-medium text-foreground">
              RTSP Stream URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rtsp"
              type="url"
              placeholder="rtsp://username:password@ip:port/stream"
              value={rtspUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRtspUrl(e.target.value)}
              className="bg-background border-border text-foreground"
              required
            />
            <p className="text-xs text-muted-foreground">Enter RTSP stream URL for live video feed</p>
          </div>
          {/* is_active Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is-active" className="text-sm font-medium text-foreground">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">Enable or disable this camera</p>
            </div>
            <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
          {/* AI Vehicle Tracking Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="vehicle-tracking" className="text-sm font-medium text-foreground">
                AI Vehicle Tracking
              </Label>
              <p className="text-xs text-muted-foreground">Enable vehicle tracking algorithm</p>
            </div>
            <Switch id="vehicle-tracking" checked={vehicleTrackingEnabled} onCheckedChange={setVehicleTrackingEnabled} />
          </div>
          {/* AI License Plate Recognition Toggle (grayed out by default) */}
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-1">
              <Label htmlFor="ai-recognition" className="text-sm font-medium text-foreground">
                AI License Plate Recognition
              </Label>
              <p className="text-xs text-muted-foreground">Enable automatic license plate detection (Coming Soon)</p>
            </div>
            <Switch id="ai-recognition" checked={aiRecognitionEnabled} onCheckedChange={setAiRecognitionEnabled} disabled />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !rtspUrl.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {camera ? "Update Camera" : "Add Camera"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
