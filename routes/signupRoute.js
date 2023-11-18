require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

router.post('/', async (req, res) => {


    try {
        const { email, password, username } = req.body;

        if (email, password, username) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await UserModel.create({
                email,
                password: hashedPassword,
                username
            });

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

            const date = new Date();
            const expireDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 10);

            res.cookie('jwt', token, { httpOnly: true, expires: expireDate });
            return res.status(200).send({ message: 'Your is signed up', status: 200 });
        }
        else {
            return res.status(400).send({ message: 'Bad request', status: 400 });
        }


    } catch (error) {
        switch (error.code) {
            case 11000:
                return res.status(403).send({ message: error.keyValue, error: 'Email already exist', status: 403 });
                break;

            default:
                return res.status(500).send({ message: 'Internal server error', status: 500 });
                break;
        }

    }


});

module.exports = router;