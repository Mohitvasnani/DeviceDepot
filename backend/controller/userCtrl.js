const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const UserModel = require("../models/userModels");

// Fields that are safe to send back to a client. Never include `password`
// here - every response below is built from this shape, not from a raw
// Mongoose document, so a password hash can't leak by accident.
const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  admin: user.admin,
  address1: user.address1,
  address2: user.address2,
  address3: user.address3,
});

// register page
const createUser = (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }

  bcrypt.hash(password, 10)
    .then(hash => {
      UserModel.create({ name, email, phone, password: hash })
        .then(user => res.status(201).json({ success: true, user: toPublicUser(user) }))
        .catch(err => {
          // Duplicate email or phone
          if (err.code === 11000) {
            return res.status(409).json({ error: 'An account with that email or phone already exists' });
          }
          console.error('Error creating user:', err.message);
          res.status(400).json({ error: 'Could not create account' });
        })
    }).catch(err => {
      console.error('Error hashing password:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    })
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
          const token = jwt.sign({ email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
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


// get ALL user API (admin only - route already enforces this)
const getAllUsers = (req, res) => {
  UserModel.find({}).select('-password')
    .then(users => {
      res.json(users.map(toPublicUser));
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

// get a ONE user API (admin only - route already enforces this)
const getUserById = (req, res) => {
  UserModel.findById(req.params.id.trim()).select('-password')
    .then(user => {
      if (!user) {
        return res.status(404).json('User not found');
      }
      res.json(toPublicUser(user));
    })
    .catch(err => {
      console.error('Error fetching user:', err);
      res.status(500).json('Internal Server Error');
    });
}

// logout user api
const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
}

// delete user (admin only - route already enforces this)
const deleteUser = async (req, res) => {
  const userId = req.params.id.trim();

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
      });
    });
}

// Fields a user is allowed to change about themselves. Email, password,
// role and admin are deliberately excluded - email changes need their own
// verified flow, password changes need bcrypt, and role/admin can only be
// touched by manageRole, which is admin-only.
const ALLOWED_SELF_UPDATE_FIELDS = ['name', 'phone', 'address1', 'address2', 'address3'];

const pickAllowedUpdates = (body) => {
  const update = {};
  for (const field of ALLOWED_SELF_UPDATE_FIELDS) {
    if (body[field] !== undefined) update[field] = body[field];
  }
  return update;
};

// Generic "update my own account" endpoint. Ownership is enforced against
// the verified token, not the :id in the URL - req.params.id is only used
// to confirm it actually points at the caller's own account.
const updateUser = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID needed' });
  }

  try {
    const target = await UserModel.findById(userId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only update your own account' });
    }

    const update = pickAllowedUpdates(req.body);

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    );

    res.json({ success: true, user: toPublicUser(updatedUser) });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// manage role (admin only - route already enforces this)
const manageRole = async (req, res) => {
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
    res.status(200).json({ message: 'User role updated successfully', user: toPublicUser(user) });
  } catch (error) {
    console.error('Error updating role:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}


// Fetch user profile by email - only the signed-in user's own profile
// (or an admin's), never anyone's profile by guessing their email.
const getUserProfile = async (req, res) => {
  const email = req.params.email;

  if (email !== req.user.email && req.user.role !== 'admin') {
    return res.status(403).json({ error: "You can only view your own profile" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json('User not found');
    }
    res.json(toPublicUser(user));
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json('Internal Server Error');
  }
};

// Update user profile - same ownership and allowlist rules as updateUser.
const updateUserProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const target = await UserModel.findById(userId);
    if (!target) {
      return res.status(404).json('User not found');
    }
    if (target.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const update = pickAllowedUpdates(req.body);

    const updatedUser = await UserModel.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    res.json({ success: true, user: toPublicUser(updatedUser) });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
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
