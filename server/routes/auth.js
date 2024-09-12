const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('../utils/jwt');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { sendVerificationEmail } = require('../utils/emailService');

const router = express.Router();

router.post('/register', validateRegister, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findByEmail(email);
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user = await User.create(name, email, hashedPassword, verificationCode);
        await sendVerificationEmail(email, verificationCode);
        res.json({ msg: 'Registration successful. Please check your email for verification code.', userId: user.id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        if (!user.is_verified) {
            return res.json({ verified: false, userId: user.id });
        }
        const token = jwt.sign({ id: user.id });
        res.json({ verified: true, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const user = await User.findById(userId);
        if (!user || user.verification_code !== code) {
            return res.status(400).json({ msg: 'Invalid verification code' });
        }
        await User.verifyUser(userId);
        const token = jwt.sign({ id: userId });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;