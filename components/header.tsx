"use client"

import { useState, useEffect } from "react"
import { Camera } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm text-muted-foreground">LOGO</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground">License Plate Recorder</h1>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-mono text-blue-500">{formatDateTime(currentTime)}</div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
