const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    createUser,
    userLogin,
    getAllUsers,
    logout, 
    getUserById, deleteUser,
    manageRole,
    updateUserProfile,
    getUserProfile,
updateUser
 }= require('../controller/userCtrl');
const router = express.Router();
// Public - no auth needed
router.post("/register", createUser);
router.post("/login", userLogin);
router.post("/logout", logout);

// Protected - must be logged in
router.get("/getuser/:id", protect, getUserById);
router.get('/profile/:email', protect, getUserProfile);
router.put('/updateprofile/:id', protect, updateUserProfile);
router.put("/updatedata/:id", protect, updateUser);

// Admin only
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/deluser/:id", protect, adminOnly, deleteUser);
router.put("/updaterole/:id", protect, adminOnly, manageRole);
module.exports= router;