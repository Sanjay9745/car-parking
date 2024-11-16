'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Car, Plus, Search, Trash } from 'lucide-react'
import axios from 'axios';
import apiUrl from '@/constants/apiUrl'
import { useRouter } from 'next/navigation'

type Vehicle = {
  _id?: string;
  id: string
  make: string
  model: string
  year: number
  lplate: string,
  park?: number
}

export default function Vehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [reload, setReload] = useState(false);
  const router = useRouter();
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    lplate: '',
  });

  useEffect(()=>{
    axios.get(apiUrl + '/vehicles/user', {
      headers: {
        'x-access-token': localStorage.getItem('token') || ''
      }
    })
    .then(response => {
      setVehicles(response.data);
    })
    .catch(error => {
      console.error("There was an error fetching the vehicles!", error);
    });
  },[reload])

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.lplate?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddVehicle = () => {
    axios.post(apiUrl + '/vehicles/user', {
      make: newVehicle.make,
      model: newVehicle.model,
      year: newVehicle.year,
      lplate: newVehicle.lplate
    }, {
      headers: {
        'x-access-token': localStorage.getItem('token') || ''
      }
    })
    .then(response => {
      console.log(response.data);
      setNewVehicle({ make: '', model: '', year: new Date().getFullYear(), lplate: '' });
      setReload(!reload);
      setIsModalOpen(false);
    })
    .catch(error => {
      console.error("There was an error adding the vehicle!", error);
    });
  }

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  }

  const confirmDeleteVehicle = () => {
    if (vehicleToDelete && vehicleToDelete._id) {
      axios.delete(apiUrl + `/vehicles/user/${vehicleToDelete._id}`, {
        headers: {
          'x-access-token': localStorage.getItem('token') || ''
        }
      })
      .then(response => {
        console.log(response.data);
        setReload(!reload);
        setIsDeleteModalOpen(false);
        setVehicleToDelete(null);
      })
      .catch(error => {
        console.error("There was an error deleting the vehicle!", error);
      });
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Select Your Vehicle</h1>
      
      <div className="flex gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the details of your new vehicle here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="make" className="text-right">
                  Make
                </Label>
                <Input
                  id="make"
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lplate" className="text-right">
                  License Plate
                </Label>
                <Input
                  id="lplate"
                  value={newVehicle.lplate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, lplate: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddVehicle}>Save Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="border rounded-lg p-4 flex items-center space-x-4">
            <Car className="h-12 w-12 text-gray-400" />
            <div>
              <h2 className="font-semibold">{vehicle.make} {vehicle.model}</h2>
              <p className="text-sm text-gray-500">Year: {vehicle.year}</p>
              <p className="text-sm text-gray-500">License Plate: {vehicle.lplate}</p>
            </div>
            {
              vehicle.park === 0 ? (
                <span className="text-sm text-red-500 ml-auto">Not in Parking Zone</span>
              ) : vehicle.park === 5 ? (
                <>
                  <span className="text-sm text-yellow-500 ml-auto">Parking</span>
                  <Button variant="outline" className="ml-auto" onClick={()=>router.push(`/parking?vehicleId=${vehicle._id}`)}>Select</Button>
                </>
              ) : vehicle.park === 10 ? (
                <>
                  <span className="text-sm text-green-500 ml-auto">Parked</span>
                  <Button variant="outline" className="ml-auto" onClick={()=>router.push(`/parking-status?vehicleId=${vehicle._id}`)}>Select</Button>
                </>
              ) : null
            }
            <Button variant="outline" className="ml-2" onClick={() => handleDeleteVehicle(vehicle)}>
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No vehicles found. Try a different search or add a new vehicle.</p>
        </div>
      )}

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteVehicle}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}