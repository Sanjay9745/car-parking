
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User'); // Adjust the path as necessary
const Vehicle = require('../../models/Vehicle');

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET; // Replace with your actual secret

// GET a single user by ID
exports.get = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//protected
exports.protected = async (req, res) => {
    try {
        res.json({ message: 'You are authorized!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// CREATE a new user
exports.create = async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            vehicles: req.body.vehicles,
            role: 1 //1 - user
        });

        const newUser = await user.save();
        let jwt = jwt.sign({ id: newUser._id, role: newUser.role }, jwtSecret, { expiresIn: '1h' });
        res.json({message: 'User created', token: jwt });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// User Login
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, role: 1 });
        if (!user) {
            return res.status(400).json({ message: 'Cannot find user' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.update = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }

        if (req.body.name != null) {
            user.name = req.body.name;
        }
        if (req.body.email != null) {
            user.email = req.body.email;
        }
        if (req.body.password != null) {
            user.password = await bcrypt.hash(req.body.password, saltRounds);
        }
        if (req.body.vehicles != null) {
            user.vehicles = req.body.vehicles;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE a user by ID
exports.delete = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }

        await user.remove();
        res.json({ message: 'Deleted User' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.paymentPending = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
        let vehicles = user.vehicles;
        let pendingVehicles = [];
        vehicles.forEach(vehicle => {
            vehicle.logs.forEach(log => {
                if (!log.paid){
                    pendingVehicles.push({vehicle,log});
                }
            });
        });
        res.json(pendingVehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}