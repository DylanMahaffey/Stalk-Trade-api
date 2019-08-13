let data = require('../../database');
let db = require('../../data')

let express = require('express');
let router = express.Router();
 
// GETs all crops
router.get('/all-crops', (req, res) => {
    res.send(data.crops)
})

// GETs all other crops
router.get('/crops', (req, res) => {
    res.send(data.crops.filter(u => { return (u.userId !== +req.params.id) }))
})

// GET user crops
router.get('/user-crops/:id', (req, res) => {
    let crops = [];
    db.getUser(req.params.id).crops.forEach(cid => {
        crops.push(db.getCropById(cid));
    });
    res.send(crops);
}); 

// GET crop by ID
router.get('/crop-by-id/:id', (req, res) => {
    let crop = data.crops.filter(u => { return (u.id === +req.params.id) })[0]
    res.send(crop);
}); 

// POST returns list of users from array of IDs
router.post('/crops-list', (req, res) => {
    let crops = [];
    req.body.list.forEach(uid => {
        crops.push(db.getCropById(uid));
    });
    res.send(crops);
})


// Add crop
function getLastCropId(){
    if(data.crops[data.crops.length -1]){
        return data.crops[data.crops.length -1].id;
    }
    else{
        return -1;
    }
}


router.post('/crop', (req, res) => {
    let newCrop = req.body
    newCrop.id = getLastCropId()+1
    data.crops.push(newCrop)
    let userCrops = data.crops.filter(u => { return (u.userId === newCrop.userId) })
    res.send(userCrops)
})



module.exports = router;