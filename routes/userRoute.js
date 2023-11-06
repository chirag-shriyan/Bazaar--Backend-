require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const AdminModel = require('../models/AdminModel');

router.get('/', async (req, res) => {

    try {
        const userId = req.headers.userId;

        const isAdmin = AdminModel.findById({ _id: id });
        const limit = 5;

        if (isAdmin) {
            const user = await UserModel.find({}).limit(limit);
            res.status(200).send({ data: user });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;