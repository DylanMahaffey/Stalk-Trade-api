let express = require('express');
let socket = require('socket.io');

let app = express();
let bodyParser = require('body-parser');
let path = require('path');

let userRoute = require('./routes/users');
let cropRoute = require('./routes/crops');
let tradesRoute = require('./routes/trades');
let messageRoute = require('./routes/messages');

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(userRoute);
app.use(cropRoute);
app.use(tradesRoute);
app.use(messageRoute);

// Handler for 404
app.use((req,res,next) => {
    res.status(404).send('incorrect path');
});


const PORT = process.env.PORT | 3000;
let server = app.listen(PORT, () => {
    console.info(`server has started on ${PORT}`)
});

function ID(){
    return '_' + Math.random().toString(36).substr(2, 9);
}

// socket server
let io = socket(server);
let database = require('../database');
let db = require('../data');


io.on('connection', socket => {
    socket.on('init', data => {
        let user = db.getUser(data.id)
        socket.emit('update-user', user)
        socket.emit('friends', db.getFriends(data.id));

        user.socket = socket.id
        user.messangers.forEach(m => {
            socket.join(db.getMessangerById(m).room)
        })
    })
    
    socket.on('login', data => {
        let login = db.verify(data)
        
        socket.emit('login',login);
    })


    
    function addMessanger(messanger){
        let room = JSON.stringify(messanger);
        let buff = new Buffer(room);
        let base64data = buff.toString('base64');
        messanger.room = JSON.stringify(base64data);

        return db.postMessanger(messanger);
    }

    // USERS
    socket.on('users', data => {
        socket.emit('users', database.users);
    })
    socket.on('user', data => {
        socket.emit('user', database.users[data.id]);
    })
    socket.on('search-user', data => {
        socket.emit('search-user', database.users[data.id]);
    })
    socket.on('friends', data => {
        socket.emit('friends', db.getFriends(data.id));
    })
    socket.on('add-user', data => {
        const newID = ID();
        database.users[newID] = data;
        socket.emit('add-user', newID);
    })
    socket.on('add-friend', data => {
        let user = db.getUser(data.id);
        let friend = db.getUser(data.friendId)
        if(user.friends.find(f => f === friend.id))
            return

        let messanger = addMessanger({
            name: "private",
            type: "private",
            members: {
                [data.id]: { 
                    id: data.id, 
                    username: user.firstName + " " + user.lastName,
                    unread: 0
                },
                [data.friendId]: { 
                    id: data.friendId, 
                    username: friend.firstName  + " " + friend.lastName,
                    unread: 0
                }
            },
            messages: []
        })      
        
        user.friends.push(data.friendId);
        user.messangers.push(messanger.id);
        
        friend.friends.push(data.id);
        friend.messangers.push(messanger.id);

        if(database.users[data.friendId].socket)
            io.to(database.users[data.friendId].socket).emit('new-messanger', messanger);
        
        socket.emit('new-messanger', messanger);
        socket.emit('friends', db.getFriends(data.id));
    })

    // CROPS
    socket.on('crops', data => {
        socket.emit('crops', database.crops)
    })
    socket.on('user-crops', data =>{
        socket.emit('user-crops', db.getUserCrops(data.id));
    })
    socket.on('search-crops', data => {
        socket.emit('search-crops', database.crops[data.id])
    })
    socket.on('add-crop', data => {
        if(!database.users[data.userId])
            return;

        db.postCrop(data)

        socket.emit('user-crops', db.getUserCrops(data.userId));
    })

    // TRADES
    // handles tradess
    socket.on('trades', data => {
        socket.emit('trades', database.trades);
    })
    socket.on('user-trades', data => {   
        socket.emit('user-trades', buildUserTrades(data.id));
    })
    socket.on('search-trade', data => {
        socket.emit('search-trades', database.trades[data.id])
    })
    socket.on('add-trade', data => {
        let newId = ID();
        database.trades[newId] = data
        socket.emit('user-trades', buildUserTrades(data.id));
    })

    function buildUserTrades(userId){
        let allTrades = {
            sent: {},
            recieved: {}
        }
        
        database.users[data.id].offersSent.forEach(tid => {
            allTrades.sent[tid] = database.trades[tid];
        })
        database.users[data.id].offers.forEach(tid => {
            allTrades.recieved[tid] = database.trades[tid];
        })

        return allTrades;
    }

    socket.on('messangers', data => {
        socket.emit('messangers', database.messangers)
    })
    socket.on('search-messangers', data => {
        socket.emit('search-messangers', db.getMessangerById(data.id));
    })
    socket.on('user-messangers', data => {        
        socket.emit('user-messangers', db.getUserMessangers(data.id))
    })
    socket.on('add-message', data => {
        let messanger = db.getMessangerById(data.messangerId);
        messanger.messages.push(data.message);
        Object.keys(messanger.members).forEach(m => {
            if(m !== data.message.authorId)
                messanger.members[m].unread++;
        })

        io.to(messanger.room).emit('update-messanger', messanger)
        io.to(messanger.room).emit('new-message', { messangerId: messanger.id,  message: data.message })
    })
    socket.on('read-messanger', data => {
        let messanger = db.getMessangerById(data.messangerId);
        Object.keys(messanger.members).forEach(m => {
            if(m === data.user)
                messanger.members[m].unread = 0;
        })

        socket.emit('update-messanger', messanger)
    })
    socket.on('join-room', data => {
        socket.join(db.getMessangerById(data.id).room)
    })

    socket.on('logout', data => {
        socket.leaveAll();
    })
})