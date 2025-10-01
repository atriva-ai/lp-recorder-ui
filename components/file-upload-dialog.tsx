"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, FileVideo, Clock, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FileUploadProps {
  onUploadSuccess?: () => void
}

export function FileUploadDialog({ onUploadSuccess }: FileUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [startTimeOffset, setStartTimeOffset] = useState("")
  const [location, setLocation] = useState("File Upload")
  const [isUploading, setIsUploading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file.",
          variant: "destructive",
        })
        return
      }
      
      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (selectedFile.size > maxSize) {
        const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1)
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
        toast({
          title: "File too large",
          description: `File size is ${fileSizeMB}MB. Maximum allowed size is ${maxSizeMB}MB.`,
          variant: "destructive",
        })
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('start_time_offset', startTimeOffset)
      formData.append('location', location)

      const response = await fetch('/api/v1/license-plates/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const result = await response.json()
      
      toast({
        title: "Upload successful",
        description: `Video "${file.name}" has been uploaded and is being processed for license plate detection.`,
      })

          // Reset form and close dialog
          setFile(null)
          setStartTimeOffset("")
          setLocation("File Upload")
          setIsOpen(false)
          
          // Notify parent component
          onUploadSuccess?.()

    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isMounted) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Add Video from File
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center">
            <FileVideo className="w-5 h-5 mr-2" />
            Upload Video File
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a video file to upload for license plate detection. Maximum file size is 500MB.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-foreground">Video File</Label>
            <Input
              id="file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="bg-background border-border text-foreground"
            />
            {file && (
              <div className="text-sm text-muted-foreground">
                <div className="font-medium">{file.name}</div>
                <div>{formatFileSize(file.size)}</div>
              </div>
            )}
          </div>

          {/* Start Time Offset */}
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Start Time Offset (Optional)
            </Label>
            <Input
              id="startTime"
              type="text"
              placeholder="HH:MM:SS or MM:SS (e.g., 01:30:00 or 90:00)"
              value={startTimeOffset}
              onChange={(e) => setStartTimeOffset(e.target.value)}
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Specify when to start AI detection in the video. Leave empty to start from beginning.
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="File Upload"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              This will appear in the Location column alongside camera inputs.
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              title={!file ? "Please select a video file first" : isUploading ? "Uploading..." : "Upload and process video"}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
