const ParkingSlot = require("../../models/ParkingSlot");
const Vehicle = require("../../models/Vehicle");

exports.addParkingSlot = async (req, res) => {
    const { slotNumber, slotType } = req.body;

    try {
        // Check if the slotNumber and slotType already exist
        const existingSlot = await ParkingSlot.findOne({ slotNumber, slotType });
        if (existingSlot) {
            return res.status(409).json({ message: "Slot already exists" });
        }

        const parkingSlot = new ParkingSlot({
            slotNumber,
            isOccupied: req.body.isOccupied,
            slotType
        });

        const newParkingSlot = await parkingSlot.save();
        res.status(201).json(newParkingSlot);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getParkingSlots = async (req, res) => {
    try {
        const parkingSlots = await ParkingSlot.aggregate([
            {
                $group: {
                    _id: "$slotType",
                    slots: {
                        $push: {
                            number: "$slotNumber",
                            isOccupied: "$isOccupied",
                            id: "$_id"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    slotType: "$_id",
                    slots: 1
                }
            }
        ]);

        res.json(parkingSlots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getParkingSlotById = async (req, res) => {
    try {
        const parkingSlot = await ParkingSlot.findById(req.params.id);
        if (parkingSlot == null) {
            return res.status(404).json({ message: 'Cannot find parking slot' });
        }
        res.json(parkingSlot);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateParkingSlotById = async (req, res) => {
    try {
        const parkingSlot = await ParkingSlot.findById(req.params.id);
        if (parkingSlot == null) {
            return res.status(404).json({ message: 'Cannot find parking slot' });
        }

        if (req.body.slotNumber != null) {
            parkingSlot.slotNumber = req.body.slotNumber;
        }
        if (req.body.isOccupied != null) {
            parkingSlot.isOccupied = req.body.isOccupied;
        }
        if (req.body.slotType != null) {
            parkingSlot.slotType = req.body.slotType;
        }

        const updatedParkingSlot = await parkingSlot.save();
        res.json(updatedParkingSlot);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteParkingSlotById = async (req, res) => {
    try {
        const parkingSlot = await ParkingSlot.findById(req.params.id);
        if (parkingSlot == null) {
            return res.status(404).json({ message: 'Cannot find parking slot' });
        }

        await parkingSlot.remove();
        res.json({ message: 'Parking slot deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.changeStatus = async (req, res) => {
    try {
        const parkingSlot = await ParkingSlot.findById(req.params.id);
        if (!parkingSlot) {
            return res.status(404).json({ message: 'Cannot find parking slot' });
        }

        if (parkingSlot.isOccupied) {
            const vehicle = await Vehicle.findById(parkingSlot.vehicle);
            if (vehicle) {
                vehicle.logs.push({
                    entry: vehicle.entry,
                    exit: new Date(), // Assuming exit time is now
                    paid: vehicle.paid,
                    cost: vehicle.cost
                });
                vehicle.slotId = null;
                vehicle.park = 0;
                vehicle.entry = null;
                vehicle.exit = null;
                vehicle.paid = false;
                vehicle.cost = 0;
                await vehicle.save();
            }
        }

        parkingSlot.isOccupied = !parkingSlot.isOccupied;
        if (!parkingSlot.isOccupied) {
            parkingSlot.vehicle = null; // Clear the vehicle reference if the slot is now free
        }
        await parkingSlot.save();

        res.json({ message: 'Parking slot status changed' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};