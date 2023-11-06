require('dotenv').config();
const express = require('express');
const router = express.Router();
const AdminModel = require('../models/AdminModel');
const UserModel = require('../models/UserModel');

function hasRole(roleArr, findRole) {

    for (let i = 0; i < roleArr.length; i++) {
        const role = roleArr[i];
        if (role === findRole) {
            return true;
        }
    }
    return false;
}

router.get('/', async (req, res) => {

    try {
        const userId = req.headers.user_id;
        const isUser = await UserModel.exists({ _id: userId });

        if (isUser) {
            const admins = await AdminModel.find({});
            res.status(200).send({ data: admins });

        } else {
            res.status(400).send({ message: 'Invalid Request' });
        }

    } catch (error) {
        switch (error.path) {
            case '_id':
                res.status(400).send({ message: 'Invalid Request' });
                break;

            default:
                res.status(500).send({ error });
                break;
        }

    }

});

router.post('/', async (req, res) => {
    const { adminId, userId, role } = req.body;

    try {
        const isAdmin = await UserModel.exists({ _id: adminId });
        res.status(200).send({ message: 'On going' });

    } catch (error) {
        res.status(500).send(error);

    }

});

module.exports = router;