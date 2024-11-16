'use client'

import { useEffect, useState, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car } from 'lucide-react'
import axios from 'axios'
import apiUrl from '@/constants/apiUrl'
import { useRouter, useSearchParams } from 'next/navigation'
import useProtected from '@/hooks/useProtected'

function ParkingSlotSelection(): any {
  const sections = ['A', 'B', 'C', 'D'];
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const [parkingSlots, setParkingSlots] = useState<any>([]);

  useEffect(() => {
    useProtected().then((isProtected:boolean) => {
      if (!isProtected) {
        router.push('/auth');
        return;
      }
     }).catch(() => {
         router.push('/auth');
     });
    if (!vehicleId) {
      router.push('/vehicles');
      return;
    }
    axios.get(apiUrl + '/parkingSlots', {
      headers: {
        'x-access-token': localStorage.getItem('token') || ''
      }
    }).then((response) => {
      if (response.status === 200) {
        setParkingSlots(response.data);
      }
    }).catch(error => {
      console.error("There was an error fetching the parking slots!", error);
    });
  }, [vehicleId, router]);

  const filteredSlots = (section: any) => {
    return parkingSlots
      .filter((slot: any) => slot.slotType === section) // Filter by slotType
      .flatMap((slot: any) => {
        if (filter === 'all') {
          return slot.slots;
        }
        if (filter === 'available') {
          return slot.slots.filter((s: any) => !s.isOccupied);
        }
        if (filter === 'occupied') {
          return slot.slots.filter((s: any) => s.isOccupied);
        }
        return []; // Return an empty array if no condition matches
      });
  };

  const handleOccupied = (slot: any) => {
    axios.post(apiUrl + '/vehicles/slot/' + vehicleId, {
      slotId: slot.id
    }, {
      headers: {
        'x-access-token': localStorage.getItem('token') || ''
      }
    }).then((response) => {
      if (response.status === 200) {
        router.replace('/parking-status?vehicleId=' + vehicleId);
      }
    }).catch(error => {
      console.error("There was an error updating the slot!", error);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Select Parking Slot</h1>

      <div className="mb-4">
        <Select onValueChange={setFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Available Parking Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={sections[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {sections.map((section) => (
                <TabsTrigger key={section} value={section}>Section {section}</TabsTrigger>
              ))}
            </TabsList>
            {sections.map((section) => (
              <TabsContent key={section} value={section}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {filteredSlots(section).map((slot: any) => (
                    <Card key={slot.id} className={slot.isOccupied ? 'bg-red-100' : 'bg-green-100'}>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Car className={`h-8 w-8 ${slot.isOccupied ? 'text-red-500' : 'text-green-500'} mb-2`} />
                        <p className="text-lg font-semibold mb-2">{section}{slot.number}</p>
                        <Button
                          variant={slot.isOccupied ? "secondary" : "outline"}
                          className="w-full"
                          disabled={slot.isOccupied}
                          onClick={() => handleOccupied(slot)}
                        >
                          {slot.isOccupied ? 'Occupied' : 'Select'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParkingSlotSelection />
    </Suspense>
  )
}