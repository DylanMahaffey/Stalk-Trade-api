let users = [
    {
        firstName: 'Dylan',
        lastName: 'Mahaffey',
        email: 'dylan@mail.com',
        password: 'pass',
        businessRating: [3,4,5,5,5],
        cropsRating: [5,5,4,4,4],
        friends: [],
        messangers: [],
        notifications: {},
        crops: [],
        watchList: [],
        offers: [],
        offersSent: [],
        socket: null
        
    },
    {
        firstName: 'Juan',
        lastName: 'Ramirez',
        email: 'juan@mail.com',
        password: 'pass',
        businessRating: [3,4,3,3,5],
        cropsRating: [5,3,5,4,4],
        friends: [],
        messangers: [],
        notifications: {},
        crops: [],
        watchList: [],
        offers: [],
        offersSent: [],
        socket: null
        
    },
    {
        firstName: 'Ham',
        lastName: 'Rios',
        email: 'ham@mail.com',
        password: 'pass',
        businessRating: [5,4,5,5,5],
        cropsRating: [5,5,5,4,4],
        friends: [],
        messangers: [],
        notifications: {},
        crops: [],
        watchList: [],
        offers: [],
        offersSent: [],
        socket: null
    }
];

let crops = [
    {
        userId: 0,
        cropName: 'Roma Tomato',
        cropType: 'vegetable',
        catagory: 'tomato',
        variety: 'roma',
        imgSrc: 'https://balconygardenweb.com/wp-content/uploads/2015/11/how-to-grow-roma-tomatoes.jpg',
        harvested: false,
        harvestDate: 'August 12 2019',
        harvestQuantity: 20,
        details: 'this will be my best crop yet!'
    },
    {
        userId: 0,
        cropName: 'Sweet Basil',
        cropType: 'herb',
        catagory: 'basil',
        variety: 'sweet',
        imgSrc: 'https://www.adaptiveseeds.com/wp-content/uploads/2014/12/basil-italian-mountain-sweet-8.jpg',
        harvested: false,
        harvestDate: 'September 15 2019',
        harvestQuantity: 20,
        details: 'this will be my best crop yet!'
    },
    {
        userId: 1,
        cropName: 'English Cucumber',
        cropType: 'vegetable',
        catagory: 'cucumber',
        variety: 'english',
        imgSrc: 'https://www.adaptiveseeds.com/wp-content/uploads/2014/12/basil-italian-mountain-sweet-8.jpg',
        harvested: false,
        harvestDate: 'August 30 2019',
        harvestQuantity: 10,
        details: 'You will definitely want these!'
    }
];

let trades = [
    {
        userId: 0,
        user: "Dylan Mahaffey",
        quantity: 5,
        cropId: 0,
        cropName: "Roma Tomato",
        deniedMessage: null,
        accepted: false,
        denied: false,
        terms: false,
        completed: false,
        Offer: {
            traderId: 1,
            quantity: 2,
            cropId: 2,
            cropName: "English Cucumber",
            offerMessage: "I Think you will like the quality of my cucumbers",
            terms: false
        }
    },
    {
        userId: 1,
        user: "Juan Ramirez",
        quantity: 5,
        cropId: 2,
        cropName: "English Cucumber",
        deniedMessage: null,
        accepted: false,
        denied: false,
        terms: false,
        completed: false,
        Offer: {
            traderId: 0,
            quantity: 2,
            cropId: 0,
            cropName: "Roma Tomato",
            offerMessage: "I Think you will like the quality of my Tomatoes",
            terms: false
        }
    }
];

let database = require('./database');

users.forEach(user => {
    postUser(user);
})
crops.forEach(crop => {
    if(crop.userId === 0){
        let user = getUserByEmail('dylan@mail.com')
        crop.userId = user.id
        
    }
    if(crop.userId === 1){
        let user = getUserByEmail('juan@mail.com')
        crop.userId = user.id
        
    }
    if(crop.userId === 2){
        let user = getUserByEmail('ham@mail.com')
        crop.userId = user.id
        
    }
    
    postCrop(crop);
})
trades.forEach(trade => {
    if(trade.userId === 0){
        let user = getUserByEmail('dylan@mail.com')
        trade.userId = user.id

    }
    if(trade.userId === 1){
        let user = getUserByEmail('juan@mail.com')
        trade.userId = user.id

    }if(trade.userId === 2){
        let user = getUserByEmail('ham@mail.com')
        trade.userId = user.id

    }
    postTrade(trade);
})


function getUserByEmail(email){
    return Object.values(database.users).find(user => { return user.email === email });
}


// POST
function ID(){
    return '_' + Math.random().toString(36).substr(2, 9);
}

function verifyUser(credentials){
    const email = credentials.email;
    const pass = credentials.password
    let user;
    let id;

    for(var x in database.users){
        if(database.users[x].email === email && database.users[x].password === pass){
            user = database.users[x];
            id = x
        }
    }
    
    const login = {
        success: !!(user),
        user,
        id
    }

    return login;
}
function postUser(user){
    const id = ID();
    user.id = id;
    database.users[id] = user;

    return id;
}
function postCrop(crop){
    const id = ID();
    crop.id = id;
    database.crops[id] = crop;

    database.users[crop.userId].crops.push(id)

    return id;
}
function postTrade(trade){    
    let id = ID();
    trade.id = id;
    database.trades[id] = trade;

    database.users[trade.userId].offersSent.push(id)

    return id;
}
function postMessanger(messanger){
    let id = ID();
    messanger.id = id;
    database.messangers[id] = messanger;

    return messanger;
}
function postMessage(message, messangerId){
    let id = ID();
    message.id = id;
    database.messangers[messangerId].messages.push(message);

    return id;
}

// GET
function getUsers(){
    return database.users;
}
function getUser(id){
    return database.users[id];
}
function getFriends(id){
    let users = [];
    getUser(id).friends.forEach(uid => {
        users.push(getUser(uid));
    });
    return users;
}
function getUserCrops(id){
    let crops = {};
    database.users[id].crops.forEach(cid => {
        crops[cid] = database.crops[cid];
    });
    return crops;
}
function getCropById(id){
    return database.crops[id];
}
function getTrade(id){
    return database.trades[id];
}
function getUserMessangers(id){
    let messangers = {}    
    
    database.users[id].messangers.forEach(m => {
        messangers[m] = database.messangers[m];
    })
    
    return messangers;
}
function getMessangerById(id){
    return database.messangers[id];
}

exports.ID = ID;

exports.verify = verifyUser;

exports.postUser = postUser;
exports.postCrop = postCrop;
exports.postTrade = postTrade;
exports.postMessanger = postMessanger;
exports.postMessage = postMessage;

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.getFriends = getFriends;
exports.getUserCrops = getUserCrops;
exports.getCropById = getCropById;
exports.getUserMessangers = getUserMessangers;
exports.getMessangerById = getMessangerById;
