var express = require('express');
var router = express.Router();
var checkToken = require('../../middleware/checkToken');

var service = require('../../service');

router.post('/', checkToken, function(req, res, next){
    service.voteService.createVote(req, function(result){
        res.json(result);
    })
});

module.exports = router;