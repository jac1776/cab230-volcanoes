const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => { 

    const auth = req.headers.authorization;
    let token = null;

    if (auth && auth.split(' ').length === 2) {
        token = auth.split(' ')[1];
        // console.log('Token:', token);

    } else if (auth) { 
        console.log('Error auth header');
        res.status(401).json({ error: true, message: "Authorization header is malformed" });
        return;

    } else {
        req.isAuthenticated = false;
        next();
        return;
    }

    try { 
        let jwt_decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!jwt_decoded) { 
            console.log('Error auth header');
            res.status(401).json({ error: true, message: "Authorization header is malformed" });
            return;
        }

        if (jwt_decoded.exp < Date.now()) { 
            console.log('Token expired');
            res.status(401).json({ error: true, message: "JWT token has expired" });
            return;
        }

        req.isAuthenticated = true;
        req.token = token;
        next();

    } catch (err) { 
        console.log('JWT invalid: ', err);
        res.status(401).json({ error: true, message: "Invalid JWT token" });
    }
}

module.exports = authorize