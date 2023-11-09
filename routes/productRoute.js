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

        const priceKey = price?.split('_')[1];
        const priceValue = price?.split('_')[0];

        if (price) {
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


        // console.log(queryObj);
        let productData = ProductModel.find(queryObj.search ? queryObj.search : queryObj);
        let totalResults = await ProductModel.countDocuments(queryObj.search ? queryObj.search : queryObj);

        if (sort_by) {
            // if the user is using "," instead of "+" in the url
            // let sortFix = sort.split(",").join(" ");
            // productData.sort(sortFix);
            productData.sort(sort_by);
        }

        if (select) {
            // if the user is using "," instead of "+" in the url
            // let selectFix = select.split(",").join(" ");
            // productData.select(selectFix);
            productData.select(select);
        }

        const page = req.query.page < 0 ? 1 : req.query.page;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;

        const resData = await productData.skip(skip).limit(limit);
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
        // const { id } = req.query;


        const productData = ProductModel.find({ _id: id });

        return res.status(200).send({ data: productData });



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
        res.status(200).json(product);

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