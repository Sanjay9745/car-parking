const express = require('express');
const controllers = require('./user'); // Adjust the path as necessary
const userAuth = require('../../middlewares/userAuth'); // Adjust the path as necessary

const router = express.Router();

router.post('/', controllers.create);
router.get('/', controllers.get);
router.put('/', controllers.update);
router.delete('/', controllers.delete);
router.post('/login', controllers.login);

module.exports = router;