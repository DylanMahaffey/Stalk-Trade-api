let data = require('../../database')
let db = require('../../data')
let msg = require('./messages');

let express = require('express');
let router = express.Router();


 
// GETs all users
router.get('/users', (req, res) => {
    res.send(data.users)
})


// GET user by ID
router.get('/user-by-id/:id', (req, res) => {   
    let user = data.users[req.params.id]
    res.send(user);
}); 

// GET suggested-friends
router.get('/suggested-friends/:id', (req, res) => {
    let users = Object.values(db.getUsers());
    res.send(users);
})

// POST returns list of users from array of IDs
router.post('/friends', (req, res) => {
    res.send(db.getFriends(req.body.id));
})

// login Authentication
router.post('/login', (req, res) => {
    res.send(db.verify(req.body));
}); 

// POST user
router.post('/user', (req, res) => {
    res.send(db.postUser(req.body))
})

// PUT user

router.put('/add-friend', (req, res) => {
    let messanger = msg.addMessanger({
        name: "private",
        type: "private",
        members: [+req.body.id,+req.body.friendId],
        messages: []
    })

    data.users.forEach(user => {
        if(user.id === +req.body.friendId)
            user.friends.push(+req.body.id);

        if(user.id === +req.body.id)
            user.friends.push(+req.body.friendId);

        user.messages.push(messanger.id)
    });

    res.send(data.messangers)
})



module.exports = router;