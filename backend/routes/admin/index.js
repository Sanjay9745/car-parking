const express = require('express');
const controller = require('./admin');
const adminAuth = require('../../middlewares/adminAuth');
const router = express.Router();

router.post('/login', controller.login);
router.get('/user/list',adminAuth, controller.getAllUsers);
router.get('/user/:id',adminAuth, controller.getUserById);
router.put('/user/:id',adminAuth, controller.updateUserById);
router.delete('/user/:id',adminAuth, controller.deleteUserById);

module.exports = router;