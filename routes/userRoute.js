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

            const isValidId = isValidObjectId(adminId);
            if (isValidId) {
                const admin = await AdminModel.findOne({ userId: adminId }).select('role');
                const isAdmin = admin && hasRole(admin.role, 'superAdmin');

                if (isAdmin) {
                    const limit = req.query.limit || 5;
                    const page = req.query.page < 0 ? 1 : req.query.page;
                    const skip = (page - 1) * limit;

                    const users = await UserModel.find({}).skip(skip).limit(limit);
                    const totalResults = await UserModel.find({}).countDocuments();
                    return res.status(200).send({ data: users, totalResults, status: 200 });
                }
                else {
                    return res.status(401).send({ message: `Access Denied`, status: 401 });
                }

            }
            else {
                return res.status(401).send({ message: `Access Denied`, status: 401 });
            }

        }
        else {
            return res.status(401).send({ message: `Access Denied`, status: 401 });
        }

    } catch (error) {
        console.log(error);
        switch (error.message) {
            case 'jwt malformed':
                return res.status(401).send({ message: `Access Denied`, status: 401 });
                break;

            default:
                return res.status(500).send({ message: 'Internal server error', status: 500 });
                break;
        }
    }
});

// To get user data

router.get('/user', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const id = token && jwt.verify(token, process.env.JWT_SECRET).id;
        if (id) {
            const isValidId = isValidObjectId(id);
            if (isValidId) {
                const user = await UserModel.findById(id).select('email username');
                const admin = await AdminModel.findOne({ userId: id }).select('role');
                if (user) {
                    const resData = {
                        data: {
                            username: user.username,
                            email: user.email,
                            role: admin?.role,
                        },
                        status: 200
                    }
                    return res.status(200).send(resData);
                }
                else {
                    return res.status(404).send({ message: 'User not found', status: 404 });
                }
            }
            else {
                return res.status(400).send({ message: `Bad Request`, status: 400 });
            }
        }
        else {
            return res.status(400).send({ message: `Bad Request`, status: 400 });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error', status: 500 });
    }
});

module.exports = router;