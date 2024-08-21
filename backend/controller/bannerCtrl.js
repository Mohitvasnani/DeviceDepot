const bannerModel = require('../models/bannerModel')
const IMG_BASE_URL = 'http://localhost:8080/';

const createBanner = (req, res) => {
    const { name, description } = req.body
    console.log(req.body);
    if (!req.file) {
        return res.status(400).json({ error: 'File is not provided' });
    }
        bannerModel.create({
            name,
            description,
            file: IMG_BASE_URL + req.file.filename

        }).then(createdBanner=>{res.json({success:true, file: createdBanner })})
        
        
    } 

const displayBanner = (req,res) =>{
    bannerModel.find({})
    .then(banners=>{
        res.json(banners)
    }).catch(error => {
        console.error('Error fetching banner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });   
}

const dltBanner = (req,res) =>{
    const bannerId = req.params.id
    bannerModel.findByIdAndDelete(bannerId)
    
    .then(banner=>{
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        console.log(`Deleted banner ${bannerId}`);
        res.status(200).json({ message: 'Banner deleted successfully' });
    }).catch(error => {
        console.error('error deleting', error);
    })
}

module.exports = {
    createBanner,
    displayBanner, 
    dltBanner
}