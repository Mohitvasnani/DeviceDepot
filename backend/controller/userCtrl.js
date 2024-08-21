const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const UserModel = require("../models/userModels");


// register page 
const createUser = (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log(req.body) 
  bcrypt.hash(password, 10)
    .then(hash => {
      UserModel.create({ name, email, phone, password: hash })
        .then(user => res.json(user))
        .catch(err => res.json(err))
    }).catch(err => console.log(err.message))
}

// login ki API
const userLogin = (req, res) => {
  // Assuming you send email and password in the request body
  const { email, password } = req.body;

  // Find user by email
  UserModel.findOne({ email })
    .then(user => {
      if (!user) {
        // User not found
        return res.status(401).json('Unauthorized');
      }

      // Check if password matches
      bcrypt.compare(password, user.password)
        .then(isPasswordValid => {
          if (!isPasswordValid) {
            // Incorrect password
            return res.status(401).json('Unauthorized');
          }

          // Generate JWT token
          const token = jwt.sign({ email: user.email, role: user.role }, 'yourSecretKey', { expiresIn: '1h' });
          res.cookie('token', token)
          return res.json({ token });
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json('Internal Server Error');
        });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json('Internal Server Error');
    });
}


// get ALL user API
const getAllUsers = (req, res) => {
  UserModel.find({})
    .then(users => {
      res.json(users);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};
// get a ONE user API
const getUserById = (req, res) => {
  console.log(`GET /getuser/${req.params.id} called`); // Log for debugging
  

  UserModel.findById(req.params.id.trim())
    .then(user => {
      if (!user) {
        return res.status(404).json('User not found');
      }
      res.json(user);
    })
    .catch(err => {
      console.error('Error fetching user:', err);
      res.status(500).json('Internal Server Error');
    });
}

// logout user api
const logout =(req, res)=>{
  // Clear the user's session or token from the server-side
    // Here, you might destroy the session, remove the token from the database, etc.

    // For example, if using JWT, you may want to invalidate the token
    // const token = req.cookies.token; // assuming token is stored in cookies
    // Invalidate token logic goes here...

    // Respond with success message
    
      // Handle logout logic, e.g., invalidate session or token
      // res.status(200).json({ message: 'Logout successful' });
      res.clearCookie('token'); // Clear the token cookie

      // Respond with success message
      res.status(200).json({ message: 'Logout successful' });
    
    
}

const deleteUser = async (req,res)=>{
   

  const userId = req.params.id.trim(); // Trim the userId to remove any extraneous whitespace
  console.log(`Deleting user with ID: "${userId}"`); // Log the trimmed userId for debugging

  UserModel.findByIdAndDelete(userId)
  .then(user => {
    if (!user) {
        return res.status(404).json('User not found');
      }
      res.json({ message: 'User deleted successfully' });
    })
    .catch(err => {
      console.error('Error deleting user:', err);
      res.status(500).json({
        message: 'Internal server error',
        error: err.message,
      });
    });
}


const updateUser = async (req, res) => {
  const userId = req.params.id;
  const update = req.body;

  if (!userId) {
    return res.json({ error: 'User ID needed' });
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.json({ error: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred', details: err });
  }
};

// manage role
const manageRole = async (req,res) =>{
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the role and isAdmin status
    user.role = user.role === 'user' ? 'admin' : 'user';
    user.admin = user.admin === false ? true : false;

    await user.save();
    console.log(user); // Debugging line
    res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }




//   const {id} = req.params
//   const {role} = req.body
//   // UserModel.findByIdAndUpdate(id, { role, admin }, {new:true})
//   // .then(user=>{
//   //   res.json(user)
//   // }).catch(err=>{
//   //   res.json(err,"failed to change role")
//   // })
 }


// Fetch user profile by email
const getUserProfile = async (req, res) => {
  const email = req.params.email;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json('Internal Server Error');
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const update = req.body;

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json('User not found');
    }
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json('Internal Server Error');
  }
};




module.exports = {
  createUser,
  userLogin, 
  getAllUsers,
  logout,
  getUserById,
  deleteUser,
  manageRole,
  updateUser,
  updateUserProfile,
  getUserProfile
}