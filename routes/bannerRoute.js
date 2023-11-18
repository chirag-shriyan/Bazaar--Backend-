require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AdminModel = require('../models/AdminModel');
const BannerModel = require('../models/BannerModel');
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


// Get banner
router.get('/', async (req, res) => {
    try {
        const data = await BannerModel.find({});
        return res.status(200).send({ url: data[0].url, status: 200 });

    } catch (error) {
        console.log({ error });
        return res.status(500).send({ message: 'Internal server error', status: 500 });
    }
});


// Added banner
router.put('/', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const adminId = token && jwt.verify(token, process.env.JWT_SECRET).id;

        if (adminId) {

            const isValidId = isValidObjectId(adminId);
            if (isValidId) {

                const admin = await AdminModel.findOne({ userId: adminId });
                const isAdmin = hasRole(admin.role, 'superAdmin');
                if (isAdmin) {
                    const banner = await BannerModel.find({});
                    if (banner[0]) {
                        const { image } = req.body;
                        await BannerModel.updateOne({ _id: banner[0]._id }, {
                            url: image
                        });
                        return res.status(204).send({ message: 'Banner updated', status: 204 });
                    }
                    else {
                        await BannerModel.create({
                            url: image
                        });
                        return res.status(201).send({ message: 'Banner created', status: 201 });
                    }

                }
                else {
                    return res.status(401).send({ message: 'Access denied', status: 401 });
                }

            }
            else {
                return res.status(401).send({ message: 'Access denied', status: 401 });
            }

        }
        else {
            return res.status(401).send({ message: 'Access denied', status: 401 });
        }

    } catch (error) {
        console.log(error);


        switch (error.name) {
            case 'ValidationError':
                return res.status(400).send({ message: error.message, status: 400 });
                break;
            case 'JsonWebTokenError':
                if (error.message === 'invalid signature') {
                    return res.status(401).send({ message: 'Access denied', status: 401 });
                }
                break;

            default:
                return res.status(500).send({ message: 'Internal server error', status: 500 });
                break;
        }

    }
});


module.exports = router;