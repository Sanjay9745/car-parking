'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Car, Plus, Search, Trash, Pen } from 'lucide-react'
import axios from 'axios';
import apiUrl from '@/constants/apiUrl'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import useAdminProtected from '@/hooks/useAdminProtected'
type Vehicle = {
    _id?: string;
    id: string;
    make: string;
    model: string;
    year: number;
    lplate: string;
    park?: number;
    entry?: string;
    exit?: string;
    paid?: boolean;
    cost?: number;
    slotNumber?: string;
    slotType?: string;
  }
  

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [reload, setReload] = useState(false);
  const router = useRouter();
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    lplate: '',
  });
const { toast } = useToast();
  useEffect(()=>{
    useAdminProtected().then((isProtected: boolean) => {
      if (!isProtected) {
        router.push('/admin/login')
      }
    }).catch(() => {
      router.push('/admin/login')
    });
    axios.get(apiUrl + '/vehicles/', {
      headers: {
        'x-access-token': localStorage.getItem('adminToken') || ''
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
    axios.post(apiUrl + '/vehicles/', {
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

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsEditModalOpen(true);
  }

  const confirmEditVehicle = () => {
    if (vehicleToEdit && vehicleToEdit._id) {
      axios.put(apiUrl + `/vehicles/${vehicleToEdit._id}`, {
        make: vehicleToEdit.make,
        model: vehicleToEdit.model,
        year: vehicleToEdit.year,
        lplate: vehicleToEdit.lplate,
        park: vehicleToEdit.park,
        entry: vehicleToEdit.entry,
        exit: vehicleToEdit.exit,
        paid: vehicleToEdit.paid,
        cost: vehicleToEdit.cost,
        slotNumber: vehicleToEdit.slotNumber,
        slotType: vehicleToEdit.slotType
      }, {
        headers: {
          'x-access-token': localStorage.getItem('adminToken') || ''
        }
      })
      .then(response => {
        setReload(!reload);
        setIsEditModalOpen(false);
        setVehicleToEdit(null);
      })
      .catch(error => {
        console.error("There was an error updating the vehicle!", error);
      });
    }
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
      <h1 className="text-2xl font-bold mb-4">Daashboard</h1>
      <div className="flex gap-4 mb-4">
        <Button onClick={() => router.push('/admin/add-entry')}>Add Entry</Button>
        <Button onClick={() => router.push('/admin/slots')}>Slots</Button>
        <Button onClick={() => {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }}>Logout</Button>
    </div>
      
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
          <div key={vehicle.id} className="border rounded-lg p-4">
            <div className="flex items-center space-x-4 mb-2">
              <Car className="h-12 w-12 text-gray-400" />
              <div>
                <h2 className="font-semibold">{vehicle.make} {vehicle.model}</h2>
                <p className="text-sm text-gray-500">Year: {vehicle.year}</p>
                <p className="text-sm text-gray-500">License Plate: {vehicle.lplate}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:mt-2 space-y-2">
              <div className="flex items-center justify-between">
                {vehicle.park === 0 ? (
                  <span className="text-sm text-red-500 whitespace-nowrap">Not in Zone</span>
                ) : vehicle.park === 5 ? (
                  <>
                    <span className="text-sm text-yellow-500">Parking</span>
                    <Button 
                      variant="outline" 
                      className="ml-auto" 
                      onClick={()=>router.push(`/admin/slots?lplate=${vehicle.lplate}`)}
                    >
                      Select
                    </Button>
                  </>
                ) : vehicle.park === 10 ? (
                  <>
                    <span className="text-sm text-green-500">Parked</span>
                    <Button 
                      variant="outline" 
                      className="ml-auto" 
                      onClick={()=>router.push(`/parking-status?vehicleId=${vehicle._id}`)}
                    >
                      Select
                    </Button>
                  </>
                )  : null}
                <Button variant="outline" className='ml-3' onClick={() => handleEditVehicle(vehicle)}>
                  <Pen className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="outline"  className='ml-3' onClick={() => handleDeleteVehicle(vehicle)}>
                  <Trash className="h-3 w-4 text-red-500" />
                </Button>
              </div>
              
           

            </div>
          </div>
        ))}
      </div>
      {filteredVehicles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No vehicles found. Try a different search or add a new vehicle.</p>
        </div>
      )}
<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit Vehicle</DialogTitle>
      <DialogDescription>
        Update the details of the vehicle here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-make" className="text-right">
          Make
        </Label>
        <Input
          id="edit-make"
          value={vehicleToEdit?.make || ''}
          onChange={(e) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, make: e.target.value } : null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-model" className="text-right">
          Model
        </Label>
        <Input
          id="edit-model"
          value={vehicleToEdit?.model || ''}
          onChange={(e) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, model: e.target.value } : null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-year" className="text-right">
          Year
        </Label>
        <Input
          id="edit-year"
          type="number"
          value={vehicleToEdit?.year || ''}
          onChange={(e) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, year: parseInt(e.target.value) } : null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-lplate" className="text-right">
          License Plate
        </Label>
        <Input
          id="edit-lplate"
          value={vehicleToEdit?.lplate || ''}
          onChange={(e) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, lplate: e.target.value } : null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-park" className="text-right">
          Parking Status
        </Label>
        <Select
          value={vehicleToEdit?.park?.toString()}
          onValueChange={(value) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, park: parseInt(value) } : null)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select parking status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Not In Parking</SelectItem>
            <SelectItem value="5">Parking</SelectItem>
            <SelectItem value="10">Parked</SelectItem>
            <SelectItem value="15">Exit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
        {/* <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="edit-slot-type" className="text-right">
        Slot Type
      </Label>
      <Select
        value={vehicleToEdit?.slotType}
        onValueChange={handleSlotChange}
      >
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select slot type" />
        </SelectTrigger>
        <SelectContent>
          {
            slotTypes.map((slotType, index) => (
              <SelectItem key={index} value={slotType}>Slot {slotType}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="edit-slot-number" className="text-right">
        Slot Number
      </Label>
      <Select
        value={vehicleToEdit?.slotNumber || ''}
        onValueChange={(value) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, slotNumber: value } : null)}
      >
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select slot number" />
        </SelectTrigger>
        <SelectContent>
          {
            slotNumbers.map((slotNumber, index) => (
              <SelectItem key={index} value={slotNumber.number}>{slotNumber.number}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div> */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-entry" className="text-right">
          Entry Time
        </Label>
        <Input
          id="edit-entry"
          type="datetime-local"
          value={vehicleToEdit?.entry || ''}
          onChange={(e) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, entry: e.target.value } : null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-exit" className="text-right">
          Exit Time
        </Label>
        <Input
          id="edit-exit"
          type="datetime-local"
          value={vehicleToEdit?.exit || ''}
          onChange={(e) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, exit: e.target.value } : null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-cost" className="text-right">
          Cost
        </Label>
        <Input
          id="edit-cost"
          type="number"
          value={vehicleToEdit?.cost || ''}
          onChange={(e) => setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, cost: parseFloat(e.target.value) } : null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">
          Payment Status
        </Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-paid"
            checked={vehicleToEdit?.paid || false}
            onCheckedChange={(checked) => 
              setVehicleToEdit(vehicleToEdit ? { ...vehicleToEdit, paid: checked as boolean } : null)
            }
          />
          <label htmlFor="edit-paid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Paid
          </label>
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
      <Button type="submit" onClick={confirmEditVehicle}>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
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
      <Toaster />
    </div>
  )
}