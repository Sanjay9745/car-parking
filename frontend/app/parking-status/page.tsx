'use client'

import { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Car, CreditCard, MapPin } from 'lucide-react';
import useProtected from '@/hooks/useProtected';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import apiUrl from '@/constants/apiUrl';
import moment from 'moment';
import { useToast } from '@/hooks/use-toast';
import useAdminProtected from '@/hooks/useAdminProtected';

const HOURLY_RATE = 2; // $2 per hour

function ParkingStatus() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [parkingAmount, setParkingAmount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [entryTime, setEntryTime] = useState<Date | null>(null);
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
    if (localStorage.getItem('adminToken')){
      useAdminProtected().then((isProtected: boolean) => {
        if (!isProtected) {
          router.push('/auth');
          return;
        }
      }).catch(() => {
        router.push('/auth');
      });
    }else if (localStorage.getItem('token')){
      useProtected().then((isProtected: boolean) => {
        if (!isProtected) {
          router.push('/auth');
          return;
        }
      }).catch(() => {
        router.push('/auth');
      });
    }  else {
      router.push('/auth');
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    axios.get(`${apiUrl}/vehicles/${vehicleId}`, {
      headers: {
        'x-access-token': localStorage.getItem('adminToken') || localStorage.getItem('token') || ''
      }
    }).then((response) => {
      if (response.status === 200) {
        const vehicle = response.data.vehicle;
        const exited = vehicle.park === 15;
        setIsExited(exited);
        if (exited) {
          router.push(`/pay-now?vehicleId=${vehicleId}`);
          return;
        }
        const slot = response.data.slot;
        const entry = moment(vehicle.entry).toDate();
        setEntryTime(entry);
        setVehicle(vehicle);
        setSlot(slot);
      }
    }).catch(error => {
      console.error("There was an error fetching the parking slots!", error);
    });

    return () => clearInterval(timer);
  }, [reload]);

  useEffect(() => {
    if (entryTime) {
      const durationInHours = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
      setParkingAmount(Math.max(0, Math.ceil(durationInHours * HOURLY_RATE)));
      setProgress(Math.min((durationInHours / 24) * 100, 100)); // Assuming max parking duration is 24 hours
    }
  }, [currentTime, entryTime]);

  const formatDuration = (start: Date, end: Date) => {
    const durationInMinutes = Math.floor(moment.duration(moment(end).diff(moment(start))).asMinutes());
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Parking Status</CardTitle>
      {
        localStorage.getItem('adminToken') ? <Button className="w-full" onClick={() => router.push('/admin/dashboard')}>Back to Admin</Button> : <Button className="w-full" onClick={() => router.push('/vehicles')}>Back to Vehicles</Button>
      }
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span className="font-semibold">{vehicle.lplate || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-semibold">Slot {slot?.slotType || ''}{slot?.slotNumber || ''}</span>
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
              <span className="font-semibold text-lg">{entryTime ? formatDuration(entryTime, currentTime) : 'Calculating...'}</span>
            </div>
            <p className="text-sm text-gray-500">Entry Time: {entryTime ? moment(entryTime).format('DD-MM-YYYY hh:mm A') : 'N/A'}</p>
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
              });
            } else {
              toast({
                title: 'Error',
                description: 'You have already exited the parking lot'
              });
            }
          }}>Exit</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParkingStatus />
    </Suspense>
  );
}
