"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Wifi, WifiOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CameraDialog } from "./camera-dialog"
import { Badge } from "@/components/ui/badge"

interface Camera {
  id: string
  position: "Front" | "Back" | "Left" | "Right"
  isActive: boolean
  cameraDevice?: string
  rtspUrl?: string
  aiRecognitionEnabled?: boolean
}

// Mock available camera devices
const availableCameraDevices = [
  "Camera-001 (USB)",
  "Camera-002 (USB)",
  "Camera-003 (Network)",
  "Camera-004 (Network)",
  "Camera-005 (USB)",
  "Camera-006 (Network)",
]

export function CameraSection() {
  const [cameras, setCameras] = useState<Camera[]>([
    {
      id: "1",
      position: "Front",
      isActive: true,
      cameraDevice: "Camera-001 (USB)",
      rtspUrl: "rtsp://192.168.1.100:554/stream1",
      aiRecognitionEnabled: true,
    },
    {
      id: "2",
      position: "Back",
      isActive: true,
      cameraDevice: "Camera-002 (USB)",
      aiRecognitionEnabled: true,
    },
    {
      id: "3",
      position: "Left",
      isActive: false,
      cameraDevice: "Camera-003 (Network)",
      rtspUrl: "rtsp://192.168.1.101:554/stream1",
      aiRecognitionEnabled: false,
    },
  ])

  const [selectedRegion, setSelectedRegion] = useState("US")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null)

  const usedPositions = cameras.map((c) => c.position)
  const assignedCameraDevices = cameras.map((c) => c.cameraDevice).filter(Boolean) as string[]

  const handleAddCamera = () => {
    setEditingCamera(null)
    setDialogOpen(true)
  }

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera)
    setDialogOpen(true)
  }

  const handleSaveCamera = (cameraData: Partial<Camera>) => {
    if (editingCamera) {
      // Update existing camera
      setCameras(cameras.map((c) => (c.id === editingCamera.id ? { ...c, ...cameraData } : c)))
    } else {
      // Add new camera
      const newCamera: Camera = {
        id: Date.now().toString(),
        position: cameraData.position!,
        isActive: cameraData.isActive ?? true,
        cameraDevice: cameraData.cameraDevice,
        rtspUrl: cameraData.rtspUrl,
        aiRecognitionEnabled: cameraData.aiRecognitionEnabled ?? true,
      }
      setCameras([...cameras, newCamera])
    }
  }

  const deleteCamera = (id: string) => {
    setCameras(cameras.filter((c) => c.id !== id))
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Cameras</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Region:</span>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-32 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              <SelectItem value="US">US</SelectItem>
              <SelectItem value="Taiwan">Taiwan</SelectItem>
              <SelectItem value="China">China</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cameras.map((camera) => (
          <Card key={camera.id} className="bg-card border-border relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={() => handleEditCamera(camera)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => deleteCamera(camera.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{camera.position} Camera</CardTitle>
                <div className="flex items-center space-x-1">
                  {camera.rtspUrl && (
                    <Badge variant="secondary" className="text-xs">
                      <Wifi className="w-3 h-3 mr-1" />
                      RTSP
                    </Badge>
                  )}
                  {camera.aiRecognitionEnabled && (
                    <Badge variant="default" className="text-xs bg-blue-600">
                      AI
                    </Badge>
                  )}
                </div>
              </div>
              {camera.cameraDevice && <p className="text-xs text-muted-foreground">{camera.cameraDevice}</p>}
            </CardHeader>

            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                {camera.isActive ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Live Feed</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <WifiOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <span className="text-muted-foreground text-sm">No Signal</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 4 - cameras.length }).map((_, index) => (
          <Card
            key={`empty-${index}`}
            className="bg-card border-border border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleAddCamera}
          >
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Camera</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CameraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        camera={editingCamera}
        onSave={handleSaveCamera}
        usedPositions={usedPositions}
        availableCameras={availableCameraDevices}
      />
    </section>
  )
}
