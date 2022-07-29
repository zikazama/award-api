const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');

// POST /login
router.post('/login', auth.getUserByEmailOrUsernameMw, auth.loginMw);

module.exports = router;
