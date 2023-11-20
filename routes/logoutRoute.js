require('dotenv').config();
const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');

router.get('/', (req, res) => {

    try {
        res.cookie('jwt', '', { httpOnly: true });
        return res.status(200).send({ message: 'user successfully logged out', status: 200 });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error', status: 500 });
    }

});

module.exports = router;