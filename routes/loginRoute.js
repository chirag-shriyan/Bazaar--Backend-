require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email: email });
        const IsVerified = await bcrypt.compare(password, user.password);

        if (IsVerified) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.status(200).send({ token: token });
        }
        else {
            res.status(401).send({ message: 'username or password is invalid' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;