const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


router.post('/register', async (req, res) => {
  const { username, password, gmail } = req.body;

    console.log(req.body,'___________________________________________________')
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, gmail, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered', token, user: { id: user._id, username: user.username } });

  } catch (err) {
    res.status(400).json({ message: "username or password already exists!" });
    
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)


  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User Name Or Password Wrong!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'User Name Or Password Wrong!' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });

  }
});

module.exports = router;
