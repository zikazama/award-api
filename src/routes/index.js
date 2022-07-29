const express = require('express');

const router = express.Router();
const userRoutes = require('./users');
const awardRoutes = require('./awards');
const authRoutes = require('./auth');
const auth = require('../middlewares/auth');

router.get('/', (req, res) => {
  res.send('Hello World!');
});

// user
router.use('/users', auth.getUserByLoginTokenMw, userRoutes);

// award
router.use('/awards', auth.getUserByLoginTokenMw, awardRoutes);

// authentication
router.use('/', authRoutes);

module.exports = router;
