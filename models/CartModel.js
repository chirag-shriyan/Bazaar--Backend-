const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: { type: mongoose.SchemaTypes.ObjectId, required: true, unique: true },
    products: { type: [String], default: [] },
}, { timestamps: true });

const CartModel = mongoose.model('carts', CartSchema);

module.exports = CartModel;