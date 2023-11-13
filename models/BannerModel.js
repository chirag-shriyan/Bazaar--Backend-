const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
    url: { type: String, required: true },
}, { timestamps: true });

const BannerModel = mongoose.model('banner', BannerSchema);

module.exports = BannerModel;