"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Wifi, WifiOff } from "lucide-react"
import { CameraDialog } from "./camera-dialog"
import { Badge } from "@/components/ui/badge"

const API_BASE: string = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : "" // fallback to relative path

interface Camera {
  id: number
  name: string
  rtsp_url: string
  location?: string
  is_active: boolean
  video_info?: any
}

interface CameraWithStatus extends Camera {
  snapshotUrl?: string
  status: "live" | "no-signal" | "error"
}

export function CameraSection() {
  const [cameras, setCameras] = useState<CameraWithStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null)

  console.log("process.env:", typeof process !== 'undefined' ? process.env : 'process.env not available');
  console.log("API_BASE:", API_BASE);

  // Fetch cameras from backend
  useEffect(() => {
    setLoading(true)
    setError(null)
    console.log("Fetching cameras from:", `${API_BASE}/api/v1/cameras/`);
    fetch(`${API_BASE}/api/v1/cameras/`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        // Initialize status and snapshotUrl for each camera
        setCameras(
          (Array.isArray(data) ? data : []).map((cam: Camera) => ({
            ...cam,
            snapshotUrl: undefined,
            status: "no-signal",
          }))
        )
      })
      .catch((e) => setError("Failed to load cameras: " + (e?.message || e)))
      .finally(() => setLoading(false))
  }, [])

  // Periodically fetch snapshot and status for each camera
  useEffect(() => {
    const interval = setInterval(() => {
      cameras.forEach((camera: CameraWithStatus) => {
        // Fetch decode status
        console.debug("Decode status API URL:", `${API_BASE}/api/v1/cameras/${camera.id}/decode-status/`)
        fetch(`${API_BASE}/api/v1/cameras/${camera.id}/decode-status/`)
          .then((res) => res.json())
          .then((statusData) => {
            let status: CameraWithStatus["status"] = "no-signal"
            if (statusData.status === "running" && statusData.frame_count > 0) {
              status = "live"
            } else if (statusData.status === "error") {
              status = "error"
            }
            setCameras((prev: CameraWithStatus[]) =>
              prev.map((c: CameraWithStatus) =>
                c.id === camera.id ? { ...c, status } : c
              )
            )
          })
          .catch(() => {
            setCameras((prev: CameraWithStatus[]) =>
              prev.map((c: CameraWithStatus) =>
                c.id === camera.id ? { ...c, status: "error" } : c
              )
            )
          })
        // Fetch latest snapshot
        const snapshotUrl = `${API_BASE}/api/v1/cameras/${camera.id}/latest-frame/?_ts=${Date.now()}`
        console.debug("Snapshot API URL:", snapshotUrl)
        fetch(snapshotUrl)
          .then((res) => {
            if (res.ok) {
              setCameras((prev: CameraWithStatus[]) =>
                prev.map((c: CameraWithStatus) =>
                  c.id === camera.id ? { ...c, snapshotUrl } : c
                )
              )
            } else {
              setCameras((prev: CameraWithStatus[]) =>
                prev.map((c: CameraWithStatus) =>
                  c.id === camera.id ? { ...c, snapshotUrl: undefined } : c
                )
              )
            }
          })
          .catch(() => {
            setCameras((prev: CameraWithStatus[]) =>
              prev.map((c: CameraWithStatus) =>
                c.id === camera.id ? { ...c, snapshotUrl: undefined } : c
              )
            )
          })
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cameras])

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
        console.log("Update camera API URL:", `${API_BASE}/api/v1/cameras/${editingCamera.id}/`);
        const res = await fetch(`${API_BASE}/api/v1/cameras/${editingCamera.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cameraData),
        })
        if (!res.ok) throw new Error("Failed to update camera")
      } else {
        // Create
        console.log("Create camera API URL:", `${API_BASE}/api/v1/cameras/`);
        const res = await fetch(`${API_BASE}/api/v1/cameras/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cameraData),
        })
        if (!res.ok) throw new Error("Failed to create camera")
      }
      // Refresh list
      console.log("Refresh cameras API URL:", `${API_BASE}/api/v1/cameras/`);
      const updated = await fetch(`${API_BASE}/api/v1/cameras/`).then((r) => r.json())
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
      console.log("Delete camera API URL:", `${API_BASE}/api/v1/cameras/${id}/`);
      const res = await fetch(`${API_BASE}/api/v1/cameras/${id}/`, { method: "DELETE" })
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
                  {camera.status === "live" && (
                    <Badge variant="default" className="text-xs bg-blue-600">Live</Badge>
                  )}
                  {camera.status === "no-signal" && (
                    <Badge variant="destructive" className="text-xs">No Signal</Badge>
                  )}
                  {camera.status === "error" && (
                    <Badge variant="destructive" className="text-xs">Error</Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{camera.rtsp_url}</p>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border overflow-hidden">
                {camera.snapshotUrl && camera.status === "live" ? (
                  <img src={camera.snapshotUrl} alt="Camera Snapshot" className="object-cover w-full h-full" />
                ) : camera.status === "error" ? (
                  <div className="text-center">
                    <WifiOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <span className="text-muted-foreground text-sm">Error</span>
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
