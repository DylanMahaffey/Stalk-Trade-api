let data = require('../../database');

let express = require('express');
let router = express.Router();
 
// GETs all crops
router.get('/trades', (req, res) => {
    res.send(data.trades)
})

// GET user crops
router.get('/user-trades/:id', (req, res) => {
    let allTrades = {
        sent: [],
        recieved: []
    }
    
    data.trades.forEach(trade => {
        if(trade.userId === +req.params.id)
        allTrades.recieved.push(trade);
        else if (trade.Offer.traderId === +req.params.id)
        allTrades.sent.push(trade);        
    })

    res.send(allTrades);
}); 

// GET crop by ID
router.get('/trade-by-id/:id', (req, res) => {
    let trade = data.trades.filter(u => { return (u.id === +req.params.id) })[0]
    res.send(trade);
}); 

// Add crop
function getLastTradeId(){
    if(data.trades[data.trades.length -1]){
        return data.trades[data.trades.length -1].id;
    }
    else{
        return -1;
    }
}


router.post('/trade', (req, res) => {
    let newTrade = req.body
    newTrade.id = getLastTradeId()+1
    data.trades.push(newTrade)
    let userTrades = data.trades.filter(u => { return (u.userId === newTrade.userId) })
    res.send(userTrades)
})



module.exports = router;