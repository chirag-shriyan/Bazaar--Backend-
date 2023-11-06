require('dotenv').config();
const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const AdminModel = require('../models/AdminModel');
const { isValidObjectId } = require('mongoose');

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
        const adminId = req.headers.admin_id;
        const isValidAdminId = isValidObjectId(adminId);

        if (isValidAdminId) {
            const admin = await AdminModel.findOne({ userId: adminId }).select('role');
            const limit = 5;
            const isAdmin = hasRole(admin.role, 'superAdmin');

            if (isAdmin) {
                const user = await UserModel.find({}).limit(limit);
                res.status(200).send({ data: user });
            }
            else {
                res.status(200).send({ message: `Access Denied` });
            }

        }
        else {
            res.status(400).send({ message: `The ObjectId:${adminId} is invalid` });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {

    try {
        const id = req.params.id;
        const isValidId = isValidObjectId(id);

        if (isValidId) {
            const user = await UserModel.findById(id).select('email username');
            res.status(200).send({ data: user });
        }
        else {
            res.status(400).send({ message: `The ObjectId:${id} is invalid` });
        }


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;