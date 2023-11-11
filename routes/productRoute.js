const express = require('express');
const ProductModel = require('../models/ProductModel');
const router = express.Router();

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
                return res.status(400).send({ message: 'You can not use search with name and description' });
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
                return res.status(400).send({ message: 'Invalid input for created_at' });
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
            return res.status(200).send({ data: resData, totalResults });

        }
        else {
            return res.status(200).send({ message: "No data found" });
        }


    } catch (error) {
        console.log(error);
        switch (error.name) {
            case 'CastError':
                return res.status(400).send({ message: 'Bad Request' });
                break;

            default:
                return res.status(500).send({ message: error });
                break;
        }
        // return res.status(500).send({ message: 'Internal server error' });

    }


});

router.get('/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const productData = await ProductModel.findById(id);

        if (productData) {
            return res.status(200).send({ data: productData });
        }
        else {
            return res.status(404).send({ message: 'Not Found' });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error' });

    }


});


// Create Product
router.post('/', async (req, res) => {

    try {
        const { name, description, price, quantity, image, categories } = req.body;

        const product = await ProductModel.create({
            name,
            description,
            price,
            quantity,
            image,
            categories
        });
        return res.status(200).json(product);

    } catch (error) {
        if (error.name === 'ValidationError') {
            console.log(error);
            return res.status(403).json(error);
        }
        else {
            return res.status(500).send({ message: 'Internal server error' });
        }
    }


});

// Update Product
router.put('/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const { name, description, price, quantity, image, categories,  } = req.body;

        const product = await ProductModel.updateOne({ _id: id }, {
            name,
            description,
            price,
            quantity,
            image,
            categories
        }
        );
        return res.status(200).json(product);

    } catch (error) {
        if (error.name === 'ValidationError') {
            console.log(error);
            return res.status(403).json(error);
        }
        else {
            return res.status(500).send({ message: 'Internal server error' });
        }
    }


});

module.exports = router;