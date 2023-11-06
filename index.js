require('dotenv').config();
const express = require('express');
const dbConnect = require('./db');
const cors = require('cors');
const app = express();
const PORT = process.env.SERVER_PORT || 4000;

app.use(express.json());
app.use(cors());

// app.use('/api/user', require('./routes/userRoute'));

app.use('/api/login', require('./routes/loginRoute'));
app.use('/api/signup', require('./routes/signupRoute'));
app.use('/api/product', require('./routes/productRoute'));
app.use('/api/user', require('./routes/userRoute'));
app.use('/api/admin', require('./routes/adminRoute'));

app.listen(PORT, async () => {
    await dbConnect();
    console.log(`http://localhost:${PORT}`);
})