const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json('Products')
})

module.exports = router;