const express = require('express');
const ProductModel = require('../models/ProductModel');
const { isValidObjectId } = require('mongoose');
const AdminModel = require('../models/AdminModel');
const jwt = require('jsonwebtoken');
const router = express.Router();


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
        const {
            name,
            description,
            price,
            categories,
            sort_by,
            created_at,
            select,
            search
        } = req.query;

        const queryObj = {};

        if (name) {
            queryObj.name = { $regex: name, $options: "i" };
        }

        if (description) {
            queryObj.description = { $regex: description, $options: "i" };
        }


        if (price) {
            const priceValue = price.split('_')[0];
            const priceKey = price.split('_')[1];
            switch (priceKey) {
                case 'eq':
                    queryObj.price = { $eq: priceValue };
                    break;
                case 'gt':
                    queryObj.price = { $gt: priceValue };
                    break;
                case 'gte':
                    queryObj.price = { $gte: priceValue };
                    break;
                case 'lt':
                    queryObj.price = { $lt: priceValue };
                    break;
                case 'lte':
                    queryObj.price = { $lte: priceValue };
                    break;

                default:
                    queryObj.price = { $gte: priceValue };
                    break;
            }
        }

        if (categories) {
            queryObj.categories = { $regex: categories, $options: "i" };
        }

        if (search) {
            if (!name && !description) {
                queryObj.search = {
                    $or:
                        [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
                }
            }
            else {
                return res.status(400).send({ message: 'You can not use search with name and description', status: 400 });
            }

        }

        let productData = ProductModel.find(queryObj.search ? queryObj.search : queryObj);
        let totalResults = await ProductModel.countDocuments(queryObj.search ? queryObj.search : queryObj);

        if (sort_by) {
            productData.sort(sort_by);
        }

        if (created_at) {

            if (created_at === 'asc') {
                productData.sort({ createdAt: 1 });
            }
            else if (created_at === 'desc') {
                productData.sort({ createdAt: -1 });
            }
            else if (created_at == 1 || created_at == -1) {
                productData.sort({ createdAt: created_at });
            }
            else {
                return res.status(400).send({ message: 'Invalid input for created_at', status: 400 });
            }
        }

        if (select) {
            productData.select(select);
        }

        const page = req.query.page < 0 ? 1 : req.query.page;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;

        const resData = await productData.limit(limit).skip(skip);
        if (resData && resData.length > 0) {
            return res.status(200).send({ data: resData, totalResults, status: 200 });

        }
        else {
            return res.status(404).send({ message: "No data found", status: 404 });
        }


    } catch (error) {
        console.log(error);
        switch (error.name) {
            case 'CastError':
                return res.status(400).send({ message: 'Bad Request', status: 400 });
                break;

            default:
                return res.status(500).send({ message: 'Internal server error', status: 500 });
                break;
        }
        // return res.status(500).send({ message: 'Internal server error' });

    }


});

router.get('/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const isValidId = isValidObjectId(id);
        if (isValidId) {
            const productData = await ProductModel.findById(id);

            if (productData) {
                return res.status(200).send({ data: productData, status: 200 });
            }
            else {
                return res.status(404).send({ message: 'Not Found', status: 404 });
            }

        }
        else {
            return res.status(400).send({ message: 'Invalid ObjectId', status: 400 });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error', status: 500 });

    }


});


// Create Product
router.post('/', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const adminId = token && jwt.verify(token, process.env.JWT_SECRET).id;

        const isValidId = adminId && isValidObjectId(adminId);

        if (isValidId) {

            const admin = await AdminModel.findOne({ userId: adminId });
            const isAdmin = admin && hasRole(admin.role, 'superAdmin');
            if (isAdmin) {
                const { name, description, price, quantity, image, imageName, categories } = req.body;

                const product = await ProductModel.create({
                    name,
                    description,
                    price,
                    quantity,
                    image,
                    imageName,
                    categories
                });
                return res.status(200).send({ product, status: 200 });
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
        if (error.name === 'ValidationError') {
            return res.status(403).send(error);
        }
        else {
            return res.status(500).send({ message: 'Internal server error', status: 500 });
        }
    }


});

// Update Product
router.put('/:id', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const adminId = token && jwt.verify(token, process.env.JWT_SECRET).id;

        const isValidId = adminId && isValidObjectId(adminId);


        if (isValidId) {
            const admin = await AdminModel.findOne({ userId: adminId });
            const isAdmin = admin && hasRole(admin.role, 'superAdmin');
            if (isAdmin) {
                const { name, description, price, quantity, image, imageName, categories, } = req.body;
                const id = req.params.id;

                const product = await ProductModel.updateOne({ _id: id }, {
                    name,
                    description,
                    price,
                    quantity,
                    image,
                    imageName,
                    categories
                }
                );
                return res.status(200).send(product);
            }
            else {
                return res.status(401).send({ message: 'Access denied', status: 401 });
            }

        }
        else {
            return res.status(401).send({ message: 'Access denied', status: 401 });
        }

    } catch (error) {
        if (error.name === 'ValidationError') {
            console.log(error);
            return res.status(403).send({ error, status: 403 });
        }
        else {
            return res.status(500).send({ message: 'Internal server error', status: 500 });
        }
    }


});

// Delete Product
router.delete('/:id', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const adminId = token && jwt.verify(token, process.env.JWT_SECRET).id;
        const isValidId = adminId && isValidObjectId(adminId);

        if (isValidId) {
            const admin = await AdminModel.findOne({ userId: adminId });
            const isAdmin = admin && hasRole(admin.role, 'superAdmin');
            if (isAdmin) {
                const id = req.params.id;
                await ProductModel.deleteOne({ _id: id });
                return res.status(200).send({ message: 'Products is deleted', status: 204 });
            }
            else {
                return res.status(401).send({ message: 'Access denied', status: 401 });
            }
        }
        else {
            return res.status(401).send({ message: 'Access denied', status: 401 });
        }

    } catch (error) {
        if (error.name === 'ValidationError') {
            console.log(error);
            return res.status(403).send({ error, status: 403 });
        }
        else {
            return res.status(500).send({ message: 'Internal server error', status: 500 });
        }
    }


});

module.exports = router;