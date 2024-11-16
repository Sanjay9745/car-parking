"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ParkingSlot = {
  id: number
  isOccupied: boolean
}

export default function Slots() {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(
    Array.from({ length: 20 }, (_, i) => ({ id: i + 1, isOccupied: Math.random() < 0.5 }))
  )
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  const toggleSlotStatus = (id: number) => {
    if (parkingSlots.find(slot => slot.id === id)?.isOccupied) {
      // If the slot is occupied, just deselect it
      setSelectedSlot(null)
    } else {
      // If the slot is vacant, select it
      setSelectedSlot(id)
    }
  }

  const occupySelectedSlot = () => {
    if (selectedSlot) {
      setParkingSlots(slots =>
        slots.map(slot =>
          slot.id === selectedSlot ? { ...slot, isOccupied: true } : slot
        )
      )
      setSelectedSlot(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Enhanced Parking Slots View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {parkingSlots.map(slot => (
              <Button
                key={slot.id}
                className={`h-20 sm:h-24 w-full ${
                  slot.isOccupied
                    ? "bg-red-500 hover:bg-red-600"
                    : selectedSlot === slot.id
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={() => toggleSlotStatus(slot.id)}
              >
                <span className="text-white font-bold">{slot.id}</span>
              </Button>
            ))}
          </div>
          <div className="mt-6 flex justify-center items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 mr-2"></div>
              <span>Vacant</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 mr-2"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 mr-2"></div>
              <span>Selected</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={occupySelectedSlot}
              disabled={!selectedSlot}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Occupy Selected Slot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}