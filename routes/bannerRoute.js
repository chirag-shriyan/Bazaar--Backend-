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
        return res.status(200).send({ url: data[0].url });

    } catch (error) {
        console.log({ error });
        return res.status(500).send({ message: 'Internal server error' });
    }
});


// Added banner
router.put('/', async (req, res) => {
    const { image } = req.body;
    const token = req.cookies.jwt;

    try {
        const id = jwt.verify(token, process.env.JWT_SECRET).id;

        if (id) {

            const isValidId = isValidObjectId(id);
            if (isValidId) {

                const isAdmin = await AdminModel.findOne({ userId: id });
                if (isAdmin) {
                    hasRole(isAdmin.role, 'superAdmin');
                    const banner = await BannerModel.find({});
                    if (banner[0]) {
                        await BannerModel.updateOne({ _id: banner[0]._id }, {
                            url: image
                        });
                        return res.status(200).send({ message: 'Banner updated' });
                    }
                    else {
                        await BannerModel.create({
                            url: image
                        });
                        return res.status(201).send({ message: 'Banner created' });
                    }

                }
                else {
                    return res.status(401).send({ message: 'Access denied' });
                }

            }
            else {
                return res.status(401).send({ message: 'Access denied' });
            }

        }

    } catch (error) {
        console.log(error);


        switch (error.name) {
            case 'ValidationError':
                return res.status(500).send({ message: error.message });
                break;
            case 'JsonWebTokenError':
                if (error.message === 'invalid signature') {
                    return res.status(500).send({ message: 'Access denied' });
                }
                break;

            default:
                return res.status(500).send({ message: 'Internal server error' });
                break;
        }

    }
});


module.exports = router;