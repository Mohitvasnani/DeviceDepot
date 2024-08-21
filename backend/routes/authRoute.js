const express = require('express')
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
router.post("/register", createUser);
router.post("/login", userLogin);
router.get("/users", getAllUsers);
router.get("/getuser/:id", getUserById);
router.post("/logout", logout);
router.delete("/deluser/:id", deleteUser);
router.put("/updaterole/:id", manageRole);
router.put("/updatedata/:id", updateUser);
// Fetch user profile by email
router.get('/profile/:email', getUserProfile);

// Update user profile
router.put('/updateprofile/:id', updateUserProfile);
module.exports= router;