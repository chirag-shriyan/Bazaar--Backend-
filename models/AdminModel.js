const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    role: { type: [String], required: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, required: true },
}, { timestamps: true });

const AdminModel = mongoose.model('admins', AdminSchema);

module.exports = AdminModel;