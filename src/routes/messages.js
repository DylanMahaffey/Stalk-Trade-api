let data = require('../../database')
let db = require('../../data')

let express = require('express');
let router = express.Router();

let addMessanger = (messanger) => {
    messanger.id = getLastMessangerId()+1;
    data.messangers.push(messanger);
    return messanger;
}

// GET user by ID
router.get('/user-messangers/:id', (req, res) => {   
    let messangers = {}
    db.getUser(req.params.id).messangers.forEach(m => {
        messangers[m] = db.getMessangerById(m);
    });
    res.send(messangers);
}); 

module.exports = router;
exports.addMessanger = addMessanger;