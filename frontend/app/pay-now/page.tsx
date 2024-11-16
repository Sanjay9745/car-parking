'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, CreditCard, Car, MapPin } from 'lucide-react'
import useProtected from '@/hooks/useProtected'
import { useRouter } from 'next/navigation'

export default function ParkingPayment() {
  const [currentTime] = useState(new Date())
  const [entryTime] = useState(new Date(currentTime.getTime() - 2 * 60 * 60 * 1000)) // 2 hours ago
  const [totalCost, setTotalCost] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const checkCircleRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useEffect(() => {
    const durationInHours = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
    setTotalCost(Math.ceil(durationInHours * 2)) // $2 per hour
  }, [currentTime, entryTime])

  useEffect(() => {
    useProtected().then((isProtected:boolean) => {
      if (!isProtected) {
        router.push('/auth');
        return;
      }
     }).catch(() => {
         router.push('/auth');
     });
    setIsVisible(true)
    if (checkCircleRef.current) {
      checkCircleRef.current.style.transition = 'transform 0.5s ease-out'
      checkCircleRef.current.style.transform = 'scale(1)'
    }
  }, [])

  const formatDuration = (start: Date, end: Date) => {
    const durationInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div
            ref={checkCircleRef}
            style={{
              transform: 'scale(0)',
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-out',
            }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </div>
          <CardTitle className="text-2xl font-bold">Parking Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Please review your parking session details and proceed to payment.
          </p>
          <div className="border-t border-b border-gray-200 py-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
                <span>Duration</span>
              </div>
              <span className="font-semibold">{formatDuration(entryTime, currentTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                <span>Total Cost</span>
              </div>
              <span className="font-semibold">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Car className="w-5 h-5 text-gray-500 mr-2" />
                <span>Vehicle</span>
              </div>
              <span className="font-semibold">ABC 123</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                <span>Slot</span>
              </div>
              <span className="font-semibold">A4</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            A receipt will be sent to your registered email address after payment.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="w-full">Pay Now</Button>
        </CardFooter>
      </Card>
    </div>
  )
}