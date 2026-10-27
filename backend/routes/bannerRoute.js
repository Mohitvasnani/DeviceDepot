const express=require ('express')
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const{
    createBanner,
    displayBanner,
    dltBanner
}=require('../controller/bannerCtrl')
const router = express.Router();
router.post('/upload', protect, adminOnly, upload.single('file'), createBanner);
router.get('/getbanner',displayBanner);
router.delete('/delete/:id', protect, adminOnly, dltBanner)
module.exports= router;
