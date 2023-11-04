require('dotenv');

const mongoose = require('mongoose');

module.exports = async function dbConnect() {
    try {
        await mongoose.connect(new URL(process.env.MONGODB_CONNECT).href);
        console.log('Connected to DB');
    } catch (error) {
        console.log(error);
    }

}

