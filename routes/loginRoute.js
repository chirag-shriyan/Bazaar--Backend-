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
        console.log(token);
        if (token) {
            const isValidToken = token && jwt.verify(token, process.env.JWT_SECRET);
            if (isValidToken) {
                return res.status(200).send({ message: 'Your is logged in', isLoggedIn: true });
            }
        }
        else {
            return res.status(401).send({ message: 'User is not logged in', isLoggedIn: false });
        }

    } catch (error) {
        return res.status(500).send({ message: 'Internal server error' });
    }
});


// To login the user
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);

    try {
        if (email && password) {
            const user = await UserModel.findOne({ email: email });
            const IsVerified = await bcrypt.compare(password, user.password);

            if (IsVerified) {
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                res.cookie('jwt', token, { httpOnly: true });
                return res.status(200).send({ message: 'Your is logged in' });
            }
            else {
                return res.status(401).send({ message: 'username or password is invalid' });
            }
        }
        else {
            return res.status(400).send({ message: 'Bad request' });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;