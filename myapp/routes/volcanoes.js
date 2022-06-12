const express = require('express');
const router = express.Router();
const auth = require('../authenticate.js')

const populatedWithin = [
    '5km',
    '10km', 
    '30km',
    '100km'
]

/* Volcanoes -- Test ln 221 - 380 
    PASS
*/
router.get('/volcanoes', function(req, res) { 

    let queries = req.query;
    const country = queries.country;
    const populatedWithin = queries.populatedWithin;

    if (!country) { 
        res.status(400).json({
            error: true,
            message: "Country is a required query parameter."
        }); 
        return; 
    }

    if (populatedWithin && !populatedWithin.includes(populatedWithin)) { 
        res.status(400).json({
            error: true,
            message: "Invalid value for populatedWithin. Only: 5km,10km,30km,100km are permitted."
        }); 
        return; 
    }

    for (const item of Object.keys(req.query)) { 
        if (item !== 'country' && item !== 'populatedWithin') { 
            res.status(400).json({
                error: true,
                message: "Invalid query parameters. Only country and populatedWithin are permitted."
            }); 
            return;
        }
    }

    req.db
        .from('volcanoes')
        .select('id', 'name', 'country', 'region', 'subregion')
        .where({ country: country })
        .andWhere(function() { 
            if (populatedWithin) { this.where(`population_${populatedWithin}`, '>', 0); }
            })
    .then((rows) => {
        res.status(200).json(rows)
    })
    .catch((err) => { 
        console.log(err);
        res.status(500).json({
            error: true, 
            message: 'An interal server error occurred.'
        })
    })
});


/* Volcanoes -- Test ln 221 - 380 
    PASS
*/
router.get('/volcano/:id', auth, function(req, res) { 

    const queryParams = Object.keys(req.query);

    if (queryParams.length > 0) {
        res.status(400).json({
            error: true,
            message: "Invalid query parameters. Query parameters are not permitted."
        }); 
        return; 
    }

    const volcanoID = req.params.id;
    console.log("req volcano param id: ", volcanoID);

    const tableColumns = ['id', 'name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude'];
    
    if (req.isAuthenticated) {  
        Array.prototype.push.apply(tableColumns, [ 'population_5km', 'population_10km', 'population_30km', 'population_100km']);
    }

    req.db
        .from('volcanoes')
        .first(tableColumns)
        .where({ id: volcanoID })
        .then((row) => {

        if (!row) { res.status(404).json({
            error: true,
            message: "Volcano with ID: ${req.params.id} not found."
        }); return; }

        res.status(200).json(row)
    })
    .catch((err) => { 
        console.log(err);
        res.status(500).json({
            error: true, 
            message: 'An interal server error occurred.'
        })
    })
});


module.exports = router;