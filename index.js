require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.SERVER_PORT || 4000;

app.use(express.json());


app.use('/api/user', require('./routes/userRoute'));
app.use('/api/product', require('./routes/productRoute'));

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})