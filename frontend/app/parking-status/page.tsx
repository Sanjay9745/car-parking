'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Car, CreditCard, MapPin } from 'lucide-react'

const HOURLY_RATE = 2 // $2 per hour

export default function ParkingStatus() {
  const [entryTime] = useState(() => new Date(Date.now() - 2 * 60 * 60 * 1000)) // 2 hours ago
  const [currentTime, setCurrentTime] = useState(new Date())
  const [parkingAmount, setParkingAmount] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const durationInHours = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
    setParkingAmount(Math.ceil(durationInHours * HOURLY_RATE))
    setProgress(Math.min((durationInHours / 24) * 100, 100)) // Assuming max parking duration is 24 hours
  }, [currentTime, entryTime])

  const formatDuration = (start: Date, end: Date) => {
    const durationInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)
    const hours = Math.floor(durationInSeconds / 3600)
    const minutes = Math.floor((durationInSeconds % 3600) / 60)
    const seconds = durationInSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Parking Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span className="font-semibold">ABC 123</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-semibold">Slot A4</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Parking Duration</span>
              <span className="text-sm text-gray-500">24h max</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="bg-primary/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">{formatDuration(entryTime, currentTime)}</span>
            </div>
            <p className="text-sm text-gray-500">Entry Time: {entryTime.toLocaleTimeString()}</p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">${parkingAmount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500">Rate: ${HOURLY_RATE.toFixed(2)} per hour</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Extend Parking Time</Button>
        </CardFooter>
      </Card>
    </div>
  )
}