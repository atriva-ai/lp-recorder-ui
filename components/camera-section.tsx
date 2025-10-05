"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Wifi, WifiOff } from "lucide-react"
import { CameraDialog } from "./camera-dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

const API_BASE: string = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : "" // fallback to relative path

// Debug: Log the API_BASE value
console.log("🔍 API_BASE value:", API_BASE)
console.log("🔍 process.env.NEXT_PUBLIC_API_URL:", typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'undefined')

interface Camera {
  id: number
  name: string
  rtsp_url: string
  location?: string
  is_active: boolean
  video_info?: any
  vehicle_tracking_enabled?: boolean
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
        console.log("🔍 FRONTEND: Received camera data:", data)
        // Initialize status and snapshotUrl for each camera
        setCameras(
          (Array.isArray(data) ? data : []).map((cam: Camera) => {
            console.log(`🔍 FRONTEND: Camera ${cam.id} is_active: ${cam.is_active}`)
            return {
              ...cam,
              snapshotUrl: undefined,
              status: "no-signal",
            }
          })
        )
      })
      .catch((e) => setError("Failed to load cameras: " + (e?.message || e)))
      .finally(() => setLoading(false))
  }, [])

  // Periodically fetch snapshot and status for ACTIVE cameras only
  useEffect(() => {
    const interval = setInterval(() => {
      cameras.forEach((camera: CameraWithStatus) => {
        // Only poll if camera is active
        if (!camera.is_active) {
          console.debug(`Skipping polling for inactive camera ${camera.id}`)
          return
        }
        
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

  const handleEditCamera = async (camera: Camera) => {
    try {
      // Fetch the latest camera data from the API
      console.log(`Fetching latest data for camera ${camera.id}`)
      const res = await fetch(`${API_BASE}/api/v1/cameras/${camera.id}/`)
      if (res.ok) {
        const latestCamera = await res.json()
        console.log(`Latest camera data:`, latestCamera)
        setEditingCamera(latestCamera)
      } else {
        console.warn(`Failed to fetch latest camera data, using cached data`)
        setEditingCamera(camera)
      }
    } catch (e) {
      console.warn(`Error fetching latest camera data:`, e)
      setEditingCamera(camera)
    }
    setDialogOpen(true)
  }

  const handleSaveCamera = async (cameraData: Partial<Camera>) => {
    console.log("handleSaveCamera called with:", cameraData)
    setLoading(true)
    setError(null)
    try {
      if (editingCamera) {
        // Update
        console.log("Update camera API URL:", `${API_BASE}/api/v1/cameras/${editingCamera.id}/`);
        console.log("Update payload:", JSON.stringify(cameraData, null, 2))
        const res = await fetch(`${API_BASE}/api/v1/cameras/${editingCamera.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cameraData),
        })
        if (!res.ok) {
          const errorText = await res.text()
          console.error("Update failed:", res.status, errorText)
          throw new Error(`Failed to update camera: ${res.status} ${errorText}`)
        }
        console.log("Update successful")
      } else {
        // Create
        console.log("Create camera API URL:", `${API_BASE}/api/v1/cameras/`);
        console.log("Create payload:", JSON.stringify(cameraData, null, 2))
        const res = await fetch(`${API_BASE}/api/v1/cameras/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cameraData),
        })
        if (!res.ok) {
          const errorText = await res.text()
          console.error("Create failed:", res.status, errorText)
          throw new Error(`Failed to create camera: ${res.status} ${errorText}`)
        }
        const createResponse = await res.json()
        console.log("Create successful, response:", createResponse)
      }
      // Refresh list
      console.log("Refresh cameras API URL:", `${API_BASE}/api/v1/cameras/`);
      const updated = await fetch(`${API_BASE}/api/v1/cameras/`).then((r) => r.json())
      setCameras(Array.isArray(updated) ? updated : [])
    } catch (e) {
      console.error("Error in handleSaveCamera:", e)
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

  const handleToggleCameraActive = async (cameraId: number, isActive: boolean) => {
    console.log(`🔄 FRONTEND: Toggling camera ${cameraId} active status to: ${isActive}`)
    console.log(`🔄 FRONTEND: API URL: ${API_BASE}/api/v1/cameras/${cameraId}/`)
    console.log(`🔄 FRONTEND: Request body:`, JSON.stringify({ is_active: isActive }))
    
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/v1/cameras/${cameraId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })
      
      console.log(`🔄 FRONTEND: Response status: ${res.status}`)
      console.log(`🔄 FRONTEND: Response ok: ${res.ok}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error(`❌ FRONTEND: Error response: ${errorText}`)
        throw new Error(`Failed to update camera: ${res.status} ${errorText}`)
      }
      
      const responseData = await res.json()
      console.log(`✅ FRONTEND: Response data:`, responseData)
      
      // Update local state
      setCameras((prev) =>
        prev.map((c) => (c.id === cameraId ? { ...c, is_active: isActive } : c))
      )
      console.log(`✅ Camera ${cameraId} ${isActive ? 'activated' : 'deactivated'} successfully`)
      
      // Refresh camera list to get latest data
      console.log("Refreshing camera list after toggle...")
      const updated = await fetch(`${API_BASE}/api/v1/cameras/`).then((r) => r.json())
      setCameras(Array.isArray(updated) ? updated.map((cam: Camera) => ({
        ...cam,
        snapshotUrl: undefined,
        status: "no-signal",
      })) : [])
    } catch (e) {
      console.error(`Error toggling camera ${cameraId}:`, e)
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVehicleTracking = async (cameraId: number, enabled: boolean) => {
    console.log(`Toggling vehicle tracking for camera ${cameraId} to: ${enabled}`)
    setLoading(true)
    setError(null)
    try {
      // Update camera in database
      const res = await fetch(`${API_BASE}/api/v1/cameras/${cameraId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_tracking_enabled: enabled }),
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to update camera: ${res.status} ${errorText}`)
      }
      
      // Vehicle tracking will be handled by the backend camera update endpoint
      // which automatically calls the AI service when vehicle_tracking_enabled changes
      
      // Update local state
      setCameras((prev) =>
        prev.map((c) => (c.id === cameraId ? { ...c, vehicle_tracking_enabled: enabled } : c))
      )
      
      // Refresh camera list to get latest data
      console.log("Refreshing camera list after vehicle tracking toggle...")
      const updated = await fetch(`${API_BASE}/api/v1/cameras/`).then((r) => r.json())
      setCameras(Array.isArray(updated) ? updated.map((cam: Camera) => ({
        ...cam,
        snapshotUrl: undefined,
        status: "no-signal",
      })) : [])
    } catch (e) {
      console.error(`Error toggling vehicle tracking for camera ${cameraId}:`, e)
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
          <Card key={camera.id} className="bg-card border-border relative">
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
              
              {/* Status Information */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Camera Status:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      camera.is_active ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {camera.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch 
                      checked={camera.is_active} 
                      onCheckedChange={(checked) => {
                        console.log(`🎛️ FRONTEND: Switch clicked for camera ${camera.id}`)
                        console.log(`🎛️ FRONTEND: Current is_active: ${camera.is_active}`)
                        console.log(`🎛️ FRONTEND: New value: ${checked}`)
                        console.log(`🎛️ FRONTEND: Will send to backend: ${checked}`)
                        handleToggleCameraActive(camera.id, checked)
                      }}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Vehicle Tracking:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      camera.vehicle_tracking_enabled ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {camera.vehicle_tracking_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch 
                      checked={camera.vehicle_tracking_enabled || false} 
                      onCheckedChange={(checked) => handleToggleVehicleTracking(camera.id, checked)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">LPR Status:</span>
                  <span className="text-gray-500 font-medium">Coming Soon</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditCamera(camera)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => deleteCamera(camera.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
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
      />
    </section>
  )
}
