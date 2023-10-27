require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

router.get('/', async (req, res) => {
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

        // const token = jwt.sign()




    } catch (error) {
        switch (error.code) {
            case 11000:
                res.status(403).send({ message: error.keyValue, error: 'Already exist in the database' });
                break;

            default:
                res.json({ message: error.message });
                break;
        }
    }
});

module.exports = router;