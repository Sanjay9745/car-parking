'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, CreditCard, Car, MapPin } from 'lucide-react'
import useProtected from '@/hooks/useProtected'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import apiUrl from '@/constants/apiUrl'
import moment from 'moment';

 function PayNow() {
  const [currentTime] = useState(new Date())
  const [totalCost, setTotalCost] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const checkCircleRef = useRef<HTMLDivElement>(null)
  const [entryTime, setEntryTime] = useState(new Date());
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicleId')
  const [vehicle, setVehicle] = useState<any>({})
  const [slot, setSlot] = useState<any>({})
  const [isExited, setIsExited] = useState(false)
  const [reload, setReload] = useState(false)
  const [log, setLog] = useState<any>({});
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
  useEffect(() => {
    axios.get(apiUrl + '/vehicles/' + vehicleId, {
      headers: {
        'x-access-token': localStorage.getItem('token') || ''
      }
    }).then((response) => {
      if (response.status === 200) {
        let vehicle = response.data.vehicle;
        let exited = vehicle.park == 15;
        setIsExited(exited);
        if (!exited) {
          router.push(`/parking-status?vehicleId=${vehicleId}`);
          return;
        }
        let slot = response.data.slot;
        setVehicle(vehicle);
        setSlot(slot);
        let logs = response.data.logs;
        let entry = new Date(vehicle.entry);
        setEntryTime(entry);
        if (!logs.length) {
          router.push(`/vehicles`);
          return;
        }
        let latestLog = logs
          ?.filter((log: any) => log.exit && !log.paid)
          ?.sort((a: any, b: any) => new Date(b.exit).getTime() - new Date(a.exit).getTime())[0];
        
        if (latestLog) {
          setLog(latestLog);
        }
      }
    }).catch(error => {
      console.error("There was an error fetching the parking slots!", error);
    })
  }, [reload]);

  const handlePay = () => {
    axios.post(apiUrl + '/vehicles/pay/'+vehicleId, {}, {
      headers: {
        'x-access-token': localStorage.getItem('token') || ''
      }
    }).then((response) => {
      if (response.status === 200) {
        router.push(`/thankyou`);
      }
    }).catch(error => {
      console.error("There was an error fetching the parking slots!", error);
    })
  }

  const formatDuration = (start: any, end: any) => {
    const startMoment = moment(start);
    const endMoment = moment(end);
    const durationInMinutes = Math.floor(moment.duration(endMoment.diff(startMoment)).asMinutes());
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
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
              <span className="font-semibold">{formatDuration(vehicle?.entry, vehicle?.exit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                <span>Total Cost</span>
              </div>
              <span className="font-semibold">${vehicle?.cost?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Car className="w-5 h-5 text-gray-500 mr-2" />
                <span>Vehicle</span>
              </div>
              <span className="font-semibold">{vehicle.lplate}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            A receipt will be sent to your registered email address after payment.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="w-full" onClick={handlePay}>Pay Now</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayNow />
    </Suspense>
  )
}