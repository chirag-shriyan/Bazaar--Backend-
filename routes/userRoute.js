require('dotenv').config();
const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
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
        const token = req.cookies.jwt;
        const adminId = token && jwt.verify(token, process.env.JWT_SECRET).id;

        if (adminId) {

            const isValidAdminId = isValidObjectId(adminId);
            if (isValidAdminId) {
                const admin = await AdminModel.findOne({ userId: adminId }).select('role');
                const isAdmin = admin && hasRole(admin.role, 'superAdmin');

                if (isAdmin) {
                    const limit = req.query.limit || 5;
                    const page = req.query.page < 0 ? 1 : req.query.page;
                    const skip = (page - 1) * limit;

                    const users = await UserModel.find({}).skip(skip).limit(limit);
                    const totalResults = await UserModel.find({}).countDocuments();
                    return res.status(200).send({ data: users, totalResults });
                }
                else {
                    return res.status(401).send({ message: `Access Denied` });
                }

            }
            else {
                return res.status(401).send({ message: `Access Denied` });
            }

        }
        else {
            return res.status(401).send({ message: `Access Denied` });
        }

    } catch (error) {
        console.log(error);
        switch (error.message) {
            case 'jwt malformed':
                return res.status(401).send({ message: `Access Denied` });
                break;

            default:
                return res.status(500).send({ message: 'Internal server error' });
                break;
        }
    }
});

router.get('/data', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const id = token && jwt.verify(token, process.env.JWT_SECRET).id;
        if (id) {
            const isValidId = isValidObjectId(id);
            if (isValidId) {
                const user = await UserModel.findById(id).select('email username');
                return res.status(200).send({ data: user });
            }
            else {
                return res.status(400).send({ message: `Bad Request` });
            }
        }
        else {
            return res.status(400).send({ message: `Bad Request` });
        }



    } catch (error) {
        return res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;