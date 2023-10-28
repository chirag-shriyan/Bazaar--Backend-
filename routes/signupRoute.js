require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

router.post('/', async (req, res) => {
    const { email, password, username } = req.body;


    try {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await UserModel.create({
            email,
            password: hashedPassword,
            username
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(200).send({ token: token });

    } catch (error) {
        switch (error.code) {
            case 11000:
                res.status(403).send({ message: error.keyValue, error: 'Already exist in the database' });
                break;

            default:
                res.status(500).send(error);
                break;
        }

    }


});

module.exports = router;