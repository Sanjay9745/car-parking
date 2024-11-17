'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Car, CreditCard, MapPin } from 'lucide-react'
import useProtected from '@/hooks/useProtected'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import apiUrl from '@/constants/apiUrl'
import moment from 'moment';
import { useToast } from '@/hooks/use-toast'

const HOURLY_RATE = 2 // $2 per hour

function ParkingStatus() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date())
  const [parkingAmount, setParkingAmount] = useState(0)
  const [progress, setProgress] = useState(0);
  const [entryTime, setEntryTime] = useState(new Date());
  const [vehicle, setVehicle] = useState<any>({});
  const [slot, setSlot] = useState<any>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const [isExited, setIsExited] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (!vehicleId) {
      router.push('/vehicles');
      return;
    }
    useProtected().then((isProtected: boolean) => {
      if (!isProtected) {
        router.push('/auth');
        return;
      }
    }).catch(() => {
      router.push('/auth');
    });
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    axios.get(apiUrl + '/vehicles/' + vehicleId, {
      headers: {
        'x-access-token': localStorage.getItem('token') || ''
      }
    }).then((response) => {
      if (response.status === 200) {
        let vehicle = response.data.vehicle;
        let exited = vehicle.park == 15;
        setIsExited(exited);
        if (exited) {
          router.push(`/pay-now?vehicleId=${vehicleId}`);
          return;
        }
        let slot = response.data.slot;
        let entry = new Date(vehicle.entry);
        setEntryTime(entry);
        setVehicle(vehicle);
        setSlot(slot);
      }
    }).catch(error => {
      console.error("There was an error fetching the parking slots!", error);
    })
    return () => clearInterval(timer)
  }, [reload])

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
              <span className="font-semibold">{vehicle.lplate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-semibold">Slot {slot?.slotType}{slot?.slotNumber}</span>
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
            <p className="text-sm text-gray-500">Entry Time: {moment(entryTime).format('DD-MM hh:MM A')}</p>
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
          <Button className="w-full" onClick={() => {
            setReload(!reload);
            if (isExited) {
              toast({
                title: 'Success',
                description: 'You have exited the parking lot successfully'
              })
            } else {
              toast({
                title: 'Error',
                description: 'You have already exited the parking lot'
              })
            }
          }}>Exit</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParkingStatus />
    </Suspense>
  )
}