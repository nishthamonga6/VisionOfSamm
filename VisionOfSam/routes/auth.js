const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Show login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Show signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    await user.save();
    res.redirect('/auth/login');
  } catch (err) {
    res.status(500).send('Signup failed');
  }
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).send('Invalid credentials');
    res.send('Login successful');
  } catch (err) {
    res.status(500).send('Login error');
  }
});

module.exports = router;
