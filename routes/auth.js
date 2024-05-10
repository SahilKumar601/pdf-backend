const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../modles/user'); 
const fetchuser = require('../middleware/fetchuser');



const jwt_secret = 'jacobgeorge'; 

router.post('/register', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Enter a strong password').isLength({ min: 5 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const token = generateToken(newUser);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: 'Server Error' });
  }
});


router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password is required').exists(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ errors: 'Invalid Credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ errors: 'Invalid Credentials' });
    }

    const token = generateToken(existingUser);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: 'Server Error' });
  }
});

function generateToken(user) {
  const data = {
    user: {
      id: user.id,
    },
  };

  return jwt.sign(data, jwt_secret); 
}

// route 3
router.post('/getuser', fetchuser , async (req, res) => {
  try {
    const userId =req.user.id;
    console.log(userId);
    const a_user = await User.findById(userId).select("-password")
    console.log(a_user);
    res.send(a_user);
  } catch (error) {
    console.error(error);
    console.error(error.message);
    res.status(500).json({ errors: 'Server Error' });
  }
});

module.exports = router;
