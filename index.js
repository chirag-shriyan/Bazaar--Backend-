require('dotenv').config();
const express = require('express');
const dbConnect = require('./db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.SERVER_PORT || 4000;

app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(cookieParser());


app.use('/api/login', require('./routes/loginRoute'));
app.use('/api/signup', require('./routes/signupRoute'));
app.use('/api/logout', require('./routes/logoutRoute'));
app.use('/api/products', require('./routes/productRoute'));
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/banner', require('./routes/bannerRoute'));

app.listen(PORT, async () => {
    await dbConnect();
    console.log(`http://localhost:${PORT}`);
})