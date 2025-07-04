
const User = require('./User');

// @desc    Get all users (for Managers)
// @route   GET /api/users
// @access  Private (Manager)
exports.getAllUsers = async (req, res, next) => {
    // #swagger.tags = ['User']
    try {
        // Filtering by role, etc. can be done via query params
        const users = await User.find(req.query);
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private (Manager or Owner)
exports.getUserById = async (req, res, next) => {
    // #swagger.tags = ['User']
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new user (e.g., an Engineer)
// @route   POST /api/users
// @access  Private (Manager)
exports.createUser = async (req, res, next) => {
    // #swagger.tags = ['User']
    try {
        const user = await User.create(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user
// @route   PATCH /api/users/:id
// @access  Private (Manager or Owner)
exports.updateUser = async (req, res, next) => {
    // #swagger.tags = ['User']
    try {
        // A user can't change their own role, and password should be updated via a separate route
        if (req.user.role !== 'MANAGER') {
            delete req.body.role;
            delete req.body.isActive;
        }
        delete req.body.password;

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Deactivate a user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Manager)
exports.deleteUser = async (req, res, next) => {
    // #swagger.tags = ['User']
    try {
        // We prefer to deactivate rather than delete
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
        }
        // Note: You might also want to handle their assignments here
        res.status(200).json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
        next(error);
    }
};


// @desc    Get all engineers (for Managers)
// @route   GET /api/user/engineers
// @access  Private (Manager)
exports.getAllEngineers = async (req, res, next) => {
    // #swagger.tags = ['User']
    try {
        // Filtering by role, etc. can be done via query params
        const users = await User.find(req.query);
        const engineers = users.filter(u=> u.role=== "ENGINEER")
        res.status(200).json({ success: true, count: engineers.length, engineers });
    } catch (error) {
        next(error);
    }
};