const Vehicle = require('../../models/Vehicle');
const User = require('../../models/User');
const ParkingSlot = require('../../models/ParkingSlot');
let imageToText = require('../../helpers/imageToText');
const moment = require('moment');
// GET all vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET a single vehicle by ID

exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Cannot find vehicle' });
        }

        const parkingSlot = await ParkingSlot.findOne({ vehicle: vehicle._id });
        const response = {
            vehicle,
            slot: parkingSlot || null
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// GET a vehicle by license plate
exports.getVehicleByLplate = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ lplate: req.params.lplate });
        if (vehicle == null) {
            return res.status(404).json({ message: 'Cannot find vehicle' });
        }
        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// CREATE a new vehicle
exports.createVehicle = async (req, res) => {
    let lplate = req.body.lplate;
    if (!lplate) {
        return res.status(400).json({ message: 'License Plate is required' });
    }

    lplate = enhanceLPlate(lplate);
    const vehicleExists = await Vehicle.findOne({ lplate: lplate });
    if (vehicleExists) {
        return res.status(400).json({ message: 'Vehicle already exists' });
    }
    const vehicle = new Vehicle({
        lplate: lplate,
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        color: req.body.color
    });

    try {
        const newVehicle = await vehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// UPDATE a vehicle by ID
exports.updateVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (vehicle == null) {
            return res.status(404).json({ message: 'Cannot find vehicle' });
        }
        let lplate = req.body.lplate;
        if (lplate) {
            lplate = enhanceLPlate(lplate);
            const vehicleExists = await Vehicle.findOne({ lplate: lplate });
            if (vehicleExists && vehicleExists._id != vehicle._id) {
                return res.status(400).json({ message: 'Vehicle already exists' });
            }
        }
        if (req.body.lplate != null) {
            vehicle.lplate = req.body.lplate;
        }
        if (req.body.make != null) {
            vehicle.make = req.body.make;
        }
        if (req.body.model != null) {
            vehicle.model = req.body.model;
        }
        if (req.body.year != null) {
            vehicle.year = req.body.year;
        }
        if (req.body.color != null) {
            vehicle.color = req.body.color;
        }

        const updatedVehicle = await vehicle.save();
        res.json(updatedVehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE a vehicle by ID
exports.deleteVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (vehicle == null) {
            return res.status(404).json({ message: 'Cannot find vehicle' });
        }

        await vehicle.remove();
        res.json({ message: 'Deleted Vehicle' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getVehicleByUserId = async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).populate('vehicles');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addVehicleToUser = async (req, res) => {
    try {
        let userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the license plate from the request params or body
        const lplate = req.params.lplate || req.body.lplate;
        if (!lplate) {
            return res.status(400).json({ message: 'License Plate is required' });
        }
        lplate = enhanceLPlate(lplate);
        let vehicle = await Vehicle.findOne({ lplate: lplate });

        // If the vehicle doesn't exist, create a new one
        if (!vehicle) {
            vehicle = new Vehicle({
                lplate: lplate,
                make: req.body.make,
                model: req.body.model,
                year: req.body.year,
                color: req.body.color
            });

            await vehicle.save(); // Save the new vehicle to the database
        }

        // Check if the vehicle is already in the user's vehicles array
        if (!user.vehicles.includes(vehicle._id)) {
            user.vehicles.push(vehicle._id); // Add the vehicle ID to the user's vehicles
            await user.save(); // Save the updated user document
        }

        res.json(user.vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUserVehicle = async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if the vehicle ID exists in the user's vehicles array
        if (!user.vehicles.includes(req.params.id)) {
            return res.status(404).json({ message: `Vehicle not found in user's list` });
        }
        
        user.vehicles.pull(req.params.id);
        await user.save();
        
        res.status(200).json({ message: 'Vehicle removed successfully', vehicles: user.vehicles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getUserVehicles = async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).populate('vehicles');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.vehicles);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.addVehicleToSlot = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: 'Vehicle ID is required' });
        }
        let slotId = req.body.slotId;
        if (!slotId) {
            return res.status(400).json({ message: 'Slot ID is required' });
        }
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (!vehicle.park == 5) {
            return res.status(400).json({ message: 'Vehicle is already parked' });
        }
        let parkingSlot = await ParkingSlot.findById(slotId);
        if (!parkingSlot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        if (parkingSlot.isOccupied) {
            return res.status(400).json({ message: 'Slot is already occupied' });
        }
        parkingSlot.vehicle = vehicle._id;
        parkingSlot.isOccupied = true;
        vehicle.park = 10;
        await vehicle.save();
        await parkingSlot.save();
        res.json(parkingSlot);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.removeVehicleFromSlot = async (req, res) => {
    try {
        let slotId = req.params.id;
        const slot = await ParkingSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        if (!slot.isOccupied) {
            return res.status(400).json({ message: 'Slot is already empty' });
        }
        slot.vehicle = null;
        slot.isOccupied = false;
        await slot.save();
        res.json(slot);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.uploadLPlate = async (req, res) => {
    try {
        let image = req.file;
        if (!image) {
            return res.status(400).json({ message: 'Image is required' });
        }
        let text = await imageToText(image.path);
        text = enhanceLPlate(text);
        res.json({message: "License Plate Extracted Successfully", lplate: text});
    }catch(err) {
        res.status(500).json({ message: err.message });
    }
}

exports.addEntry = async (req, res) => {
    try {
        let lplate = req.body.lplate;
        lplate = enhanceLPlate(lplate);
        let vehicle = await Vehicle.findOne({ lplate: lplate });
        if (!vehicle) {
        }
        if (vehicle.park === 0) {
            vehicle.park = 5;
        } else {
            return res.status(400).json({ message: 'Vehicle is already parked' });
        }
        vehicle.entry = moment().toISOString();
        await vehicle.save();
        res.json(vehicle);
    }catch(err) {
        res.status(500).json({ message: err.message });
    }
}

exports.addExit = async (req, res) => {
    try {
        let lplate = req.body.lplate;

        let vehicle = await Vehicle.findOne({ lplate: lplate });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (vehicle.park === 0) {
            return res.status(400).json({ message: 'Vehicle is already out' });
        }
        vehicle.park = 0;
        vehicle.exit = moment().toISOString();
        let entry = moment(vehicle.entry);
        let exit = moment(vehicle.exit);
        let duration = moment.duration(exit.diff(entry));
        let hours = duration.asHours();
        let cost = hours * 2;
        let logs = {
            entry: vehicle.entry,
            exit: vehicle.exit,
            duration: hours,
            cost: cost,
            paid: false
        }
        vehicle.logs.push(logs);
        vehicle.entry = null;
        vehicle.exit = null;
        let parkingSlot = await ParkingSlot.findOne({ vehicle: vehicle._id });
        if (parkingSlot) {
            parkingSlot.vehicle = null;
            parkingSlot.isOccupied = false;
            await parkingSlot.save();
        }
        await vehicle.save();
        res.json(vehicle);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

let enhanceLPlate =  (lplate) => {
    lplate = lplate.toUpperCase();
    lplate = lplate.replace(/[^a-zA-Z0-9]/g, '').replace(/\s/g, '');
    return lplate;
}