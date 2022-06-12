const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const authorize = require('../authenticate');
const router = express.Router();


// Register -- Tests ln 34 - 110
// PASS
router.post('/register', function(req, res) {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) { 
        res.status(400).json({
            error: true,
            message: "Request body incomplete, both email and password are required"
        });
        return; 
    }

    req.db
    .from('users')
    .select('*')
    .where({ email: email })
        .then((users) => { 
            if (users.length > 0) { 
                res.status(409).json({
                    error: true,
                    message: "User already exists"
                });
                return;
            }

        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);
        req.db
            .from('users')
            .insert({ email: email, password_hash: hash })
            .then(() => { 
                res.status(201).json({
                    message: "User created" 
            });
        });
    });
});


// Login -- Tests ln 112 - 217
router.post('/login', function(req, res) { 

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) { 
        res.status(400).json({
            error: true,
            message: "Request body incomplete, both email and password are required"
        });
        return; 
    }

    req.db
        .from('users')
        .select('*')
        .where({ email: email })
        .then((users) => { 
            if (users.length === 0) {
                 return; }

        const user = users[0];
        return bcrypt.compare(password, user.password_hash);

    }).then((match) => {
        if (!match) {
            res.status(401).json({
                error: true,
                message: "Incorrect email or password"
            });
            return;
        }

        const expires_in = 60 * 60 * 24 
        const exp = Date.now() + expires_in * 1000;
        const token = jwt.sign({ email, exp }, process.env.JWT_KEY);
        
        res.status(200).json({ 
            token: token, 
            token_type: 'Bearer',
            expires_in: expires_in
        });
    });
});

// Profile GET -- Tests 629 - 764 
// PASS
router.get('/:email/profile', authorize, function(req, res) { 

    const email = req.params.email;

    req.db
        .from('users')
        .first('*')
        .where({ email: email })
            .then((user) => {
                if (!user) { 
                    res.status(404).json({
                    error: true,
                    message: "User not found"
                }); 
                return;
                }

        let userDetails = {
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        }

        if (req.token) { 
            const jwtCheck = jwt.verify(req.token, process.env.JWT_KEY);

            if (req.isAuthenticated && jwtCheck.email === email) { 
                userDetails.dob = user.dob;
                userDetails.address = user.address;
            }
        }

        res.status(200).json(userDetails);
    });
});


module.exports = router;