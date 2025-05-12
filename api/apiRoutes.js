const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password,
            role
        });

        await newUser.save();
        req.session.user = newUser;

        // Redirect to respective dashboard
        if (role === 'doctor') {
            return res.redirect('/dashborddoctor');
        } else {
            return res.redirect('/dashbordpatient');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).send('Invalid credentials');
        }

        req.session.user = user;

        // Redirect based on role
        if (user.role === 'doctor') {
            return res.redirect('/dashborddoctor');
        } else {
            return res.redirect('/dashbordpatient');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
