const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    imageName: { type: String, required: true },
    categories: { type: String, required: true },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });

const ProductModel = mongoose.model('products', ProductSchema);

module.exports = ProductModel;