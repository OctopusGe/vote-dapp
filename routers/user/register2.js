var express = require('express');
var router = express.Router();

var service = require('../../service');

router.get('/', function(req, res, next){
    res.render('register');
});

module.exports = router;