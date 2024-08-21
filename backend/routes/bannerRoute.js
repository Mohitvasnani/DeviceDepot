const express=require ('express')
const upload = require('../middleware/upload');
const{
    createBanner,
    displayBanner,
    dltBanner
}=require('../controller/bannerCtrl')
const router = express.Router();
router.post('/upload', upload.single('file'), createBanner);
router.get('/getbanner',displayBanner);
router.delete('/delete/:id', dltBanner)
module.exports= router;