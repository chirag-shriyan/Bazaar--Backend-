const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CartModel = require('../models/CartModel');
const ProductModel = require('../models/ProductModel');
const { isValidObjectId } = require('mongoose');

// Get Products form the cart
router.get('/', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const id = token && jwt.verify(token, process.env.JWT_SECRET).id;
        if (id) {
            const isValidId = isValidObjectId(id);
            if (isValidId) {
                const userCart = await CartModel.find({ userId: id });

                if (userCart) {
                    const cartProducts = await ProductModel.find({ userId: userCart.products });
                    return res.status(200).send(cartProducts);
                }
                else {
                    return res.status(404).send({ message: 'User cart not found', status: 404 });
                }
            }
            else {
                return res.status(400).send({ message: 'Bad Request', status: 400 });
            }
        }
        else {
            return res.status(400).send({ message: 'Bad Request', status: 400 });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error', status: 500 });
    }

});

// Add Product to the cart
router.put('/', async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const id = token && jwt.verify(token, process.env.JWT_SECRET).id;
        if (id) {
            const isValidId = isValidObjectId(id);
            if (isValidId) {
                const { products } = req.body;
                const userCart = await CartModel.find({ userId: id });
                if (userCart && products) {
                    const updatedCart = {
                        userId: id,
                        products: products
                    }
                    const cart = await CartModel.updateOne({ userId: id }, updatedCart);
                    return res.status(200).send({ message: 'Products is add to your cart', cart: cart, status: 200 });
                }
                else {

                    if (products) {

                        const newCart = {
                            userId: id,
                            products: products
                        }
                        const cart = await CartModel.create(newCart);
                        return res.status(200).send({ message: 'Products is add to your cart', cart: cart, status: 200 });
                    }
                    else {
                        return res.status(400).send({ message: 'Bad Request', status: 400 });
                    }

                }

            }
            else {
                return res.status(400).send({ message: 'Bad Request', status: 400 });
            }
        }
        else {
            return res.status(400).send({ message: 'Bad Request', status: 400 });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error', status: 500 });
    }

});