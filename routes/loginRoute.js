require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

// To check if user is logged in
router.get('/', async (req, res) => {

    try {
        const token = req.cookies.jwt;

        if (token) {
            const isValidToken = jwt.verify(token, process.env.JWT_SECRET);
            if (isValidToken) {

                const date = new Date();
                const expireDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 10);

                res.cookie('jwt', token, { httpOnly: true, expires: expireDate });
                return res.status(200).send({ message: 'Your is logged in', isLoggedIn: true, status: 200 });
            }
        }
        else {
            return res.status(200).send({ message: 'User is not logged in', isLoggedIn: false, status: 200 });
        }

    } catch (error) {
        return res.status(500).send({ message: 'Internal server error', status: 500 });
    }
});


// To login the user
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (email && password) {
            const user = await UserModel.findOne({ email: email });
            const IsVerified = await bcrypt.compare(password, user.password);

            if (IsVerified) {
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

                const date = new Date();
                const expireDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 10);

                res.cookie('jwt', token, { httpOnly: true, expires: expireDate });
                return res.status(200).send({ message: 'Your is logged in', status: 200 });
            }
            else {
                return res.status(400).send({ message: 'username or password is invalid', status: 400 });
            }
        }
        else {
            return res.status(400).send({ message: 'Bad request', status: 400 });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error', status: 500 });
    }
});

module.exports = router;