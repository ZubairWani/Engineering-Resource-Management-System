const Assignment = require('./Assignment');
const Project = require('../Project/Project');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private (Manager: all, Engineer: own)
exports.getAllAssignments = async (req, res, next) => {
    // #swagger.tags = ['Assignment']
    try {
        let query;
        if (req.user.role === 'MANAGER') {
            query = Assignment.find(req.query);
        } else { // 'ENGINEER'
            query = Assignment.find({ engineerId: req.user.id, ...req.query });
        }

        const assignments = await query.populate('engineer', 'name email').populate('project', 'name');
        res.status(200).json({ success: true, count: assignments.length, data: assignments });
    } catch (error) {
        next(error);
    }
};


// @desc    Get a single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private (Manager or assigned Engineer)
exports.getAssignmentById = async (req, res, next) => {
    // #swagger.tags = ['Assignment']
    try {
        const assignment = await Assignment.findById(req.params.id).populate('engineer', 'name email').populate('project', 'name status');
        if (!assignment) {
            return res.status(404).json({ success: false, message: `Assignment not found with id ${req.params.id}` });
        }

        // Check permissions
        if (req.user.role !== 'MANAGER' && assignment.engineerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to view this assignment.' });
        }

        res.status(200).json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Manager)
exports.createAssignment = async (req, res, next) => {
    // #swagger.tags = ['Assignment']
    try {
        // Manager can assign engineers to projects they manage
        const project = await Project.findById(req.body.projectId);
        if (project && project.managerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only assign engineers to projects you manage.' });
        }

        const assignment = await Assignment.create(req.body);
        res.status(201).json({ success: true, data: assignment });
    } catch (error) {
        // Handle unique index error
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This engineer is already assigned to this project.' });
        }
        next(error);
    }
};

// @desc    Update an assignment
// @route   PATCH /api/assignments/:id
// @access  Private (Manager)
exports.updateAssignment = async (req, res, next) => {
    // #swagger.tags = ['Assignment']
    try {
        let assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: `Assignment not found with id ${req.params.id}` });
        }

        // Check if manager owns the project this assignment belongs to
        const project = await Project.findById(assignment.projectId);
        if (project.managerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only update assignments for projects you manage.' });
        }

        assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Manager)
exports.deleteAssignment = async (req, res, next) => {
    // #swagger.tags = ['Assignment']
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: `Assignment not found with id ${req.params.id}` });
        }

        // Check if manager owns the project this assignment belongs to
        const project = await Project.findById(assignment.projectId);
        if (project.managerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only delete assignments for projects you manage.' });
        }

        await assignment.remove();
        res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
        next(error);
    }
};