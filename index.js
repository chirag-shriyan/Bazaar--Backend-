require('dotenv').config();
const express = require('express');
const dbConnect = require('./db');
const app = express();
const PORT = process.env.SERVER_PORT || 4000;

app.use(express.json());

// app.use('/api/user', require('./routes/userRoute'));

app.use('/api/login', require('./routes/loginRoute'));
app.use('/api/signup', require('./routes/signupRoute'));
app.use('/api/product', require('./routes/productRoute'));

app.listen(PORT, async () => {
    await dbConnect();
    console.log(`http://localhost:${PORT}`);
})