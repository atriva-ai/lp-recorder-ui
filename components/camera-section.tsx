"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Wifi, WifiOff } from "lucide-react"
import { CameraDialog } from "./camera-dialog"
import { Badge } from "@/components/ui/badge"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

interface Camera {
  id: number
  name: string
  rtsp_url: string
  location?: string
  is_active: boolean
  video_info?: any
}

export function CameraSection() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null)

  // Fetch cameras from backend
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/v1/cameras`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setCameras(Array.isArray(data) ? data : [])
      })
      .catch((e) => setError("Failed to load cameras: " + (e?.message || e)))
      .finally(() => setLoading(false))
  }, [])

  const handleAddCamera = () => {
    setEditingCamera(null)
    setDialogOpen(true)
  }

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera)
    setDialogOpen(true)
  }

  const handleSaveCamera = async (cameraData: Partial<Camera>) => {
    setLoading(true)
    setError(null)
    try {
      if (editingCamera) {
        // Update
        const res = await fetch(`${API_BASE}/api/v1/cameras/${editingCamera.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cameraData),
        })
        if (!res.ok) throw new Error("Failed to update camera")
      } else {
        // Create
        const res = await fetch(`${API_BASE}/api/v1/cameras`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cameraData),
        })
        if (!res.ok) throw new Error("Failed to create camera")
      }
      // Refresh list
      const updated = await fetch(`${API_BASE}/api/v1/cameras`).then((r) => r.json())
      setCameras(Array.isArray(updated) ? updated : [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const deleteCamera = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/v1/cameras/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete camera")
      setCameras((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Cameras</h2>
        <Button onClick={handleAddCamera}>Add Camera</Button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cameras.length === 0 && !loading && !error && (
          <div className="col-span-4 text-center text-muted-foreground">No cameras found.</div>
        )}
        {cameras.map((camera) => (
          <Card key={camera.id} className="bg-card border-border relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => handleEditCamera(camera)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground" onClick={() => deleteCamera(camera.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{camera.location || camera.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  {camera.rtsp_url && (
                    <Badge variant="secondary" className="text-xs">
                      <Wifi className="w-3 h-3 mr-1" />
                      RTSP
                    </Badge>
                  )}
                  {camera.is_active && (
                    <Badge variant="default" className="text-xs bg-blue-600">Active</Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{camera.rtsp_url}</p>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                {camera.is_active ? (
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
      </div>
      <CameraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        camera={editingCamera}
        onSave={handleSaveCamera}
        usedPositions={[]}
        availableCameras={[]}
      />
    </section>
  )
}
