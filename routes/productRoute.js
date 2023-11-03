const express = require('express');
const ProductModel = require('../models/ProductModel');
const router = express.Router();

router.get('/', async (req, res) => {

    try {

        res.json('Products');
    } catch (error) {
        res.status(500).send(error);
    }


});



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
            res.status(403).json(error);
        }
        else {
            res.status(500).send(error);
        }
    }


});

module.exports = router;