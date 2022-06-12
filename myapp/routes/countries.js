const express = require('express');
const router = express.Router();

/* Countries -- Test ln 5 - 30 
    PASS
*/
router.get('/', function(req, res) { 

    const queryParams = Object.keys(req.query);

    if (queryParams.length > 0) {
        res.status(400).json({
            error: true,
            message: "Invalid query parameters. Query parameters are not permitted."
        }); 
        return; 
    }

    req.db
        .from('volcanoes')
        .distinct('country')
        .whereNotNull('country')
        .orderBy('country')
    .then((rows) => {
        const countries = rows.map((row) => row.country)
        res.status(200).json(countries)
    })
    .catch((err) => { 
        console.log(err);
        res.status(500).json({
            error: true, 
            message: 'Something went wrong'
        });
    })
});

module.exports = router;