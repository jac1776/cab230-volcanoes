var express = require('express');
var router = express.Router();

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

/* Swagger -- Test ln 1294 
    PASS
*/
router.use('/', swaggerUI.serve);
router.get('/', swaggerUI.setup(swaggerDocument));

/* Me -- Test ln 1372 
    PASS
*/
router.get('/me', function(req, res) {
  res.status(200).json({
      name: 'Jesse Conis',
      student_number: 'n9749543'
  });
});

module.exports = router;
