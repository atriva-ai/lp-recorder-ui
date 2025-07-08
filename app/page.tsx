"use client"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { CameraSection } from "@/components/camera-section"
import { DetectionSection } from "@/components/detection-section"
import { RepeatedPlatesSection } from "@/components/repeated-plates-section"

// Mock data for detected license plates
const mockDetections = [
  {
    id: 1,
    location: "Front",
    date: "2024-01-07",
    time: "14:30:25",
    plateNumber: "ABC-123",
    plateSnapshot: "/placeholder.svg?height=60&width=120",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    location: "Back",
    date: "2024-01-07",
    time: "14:28:15",
    plateNumber: "XYZ-789",
    plateSnapshot: "/placeholder.svg?height=60&width=120",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    location: "Left",
    date: "2024-01-07",
    time: "14:25:10",
    plateNumber: "DEF-456",
    plateSnapshot: "/placeholder.svg?height=60&width=120",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 4,
    location: "Right",
    date: "2024-01-07",
    time: "14:22:05",
    plateNumber: "ABC-123",
    plateSnapshot: "/placeholder.svg?height=60&width=120",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 5,
    location: "Front",
    date: "2024-01-07",
    time: "14:20:30",
    plateNumber: "GHI-789",
    plateSnapshot: "/placeholder.svg?height=60&width=120",
    fullImage: "/placeholder.svg?height=400&width=600",
  },
]

// Mock data for repeated license plates
const mockRepeatedPlates = {
  "1": [
    { plateNumber: "ABC-123", count: 3, detections: mockDetections.filter((d) => d.plateNumber === "ABC-123") },
    { plateNumber: "XYZ-789", count: 2, detections: mockDetections.filter((d) => d.plateNumber === "XYZ-789") },
  ],
  "3": [
    { plateNumber: "ABC-123", count: 5, detections: mockDetections.filter((d) => d.plateNumber === "ABC-123") },
    { plateNumber: "XYZ-789", count: 3, detections: mockDetections.filter((d) => d.plateNumber === "XYZ-789") },
    { plateNumber: "DEF-456", count: 2, detections: mockDetections.filter((d) => d.plateNumber === "DEF-456") },
  ],
  "7": [
    { plateNumber: "ABC-123", count: 8, detections: mockDetections.filter((d) => d.plateNumber === "ABC-123") },
    { plateNumber: "XYZ-789", count: 6, detections: mockDetections.filter((d) => d.plateNumber === "XYZ-789") },
    { plateNumber: "DEF-456", count: 4, detections: mockDetections.filter((d) => d.plateNumber === "DEF-456") },
    { plateNumber: "GHI-789", count: 3, detections: mockDetections.filter((d) => d.plateNumber === "GHI-789") },
  ],
}

const cameras = [
  { id: 1, position: "Front", active: true },
  { id: 2, position: "Back", active: true },
  { id: 3, position: "Left", active: false },
  { id: 4, position: "Right", active: true },
]

export default function Dashboard() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="license-plate-recorder-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-6 space-y-8">
          <CameraSection cameras={cameras} />
          <DetectionSection mockDetections={mockDetections} />
          <RepeatedPlatesSection mockRepeatedPlates={mockRepeatedPlates} />
        </main>
      </div>
    </ThemeProvider>
  )
}
