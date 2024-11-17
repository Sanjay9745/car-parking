
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User'); // Adjust the path as necessary
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET; // Replace with your actual secret

// GET all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Admin Login
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, role: 2 });
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

// UPDATE a user by ID
exports.updateUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
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
exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }

        await user.remove();
        res.json({ message: 'Deleted User' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.protected = async (req, res) => {
    try {
        res.json({ message: 'You are an admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}