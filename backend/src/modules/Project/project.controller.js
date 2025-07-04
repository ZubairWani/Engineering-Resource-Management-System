const mongoose = require('mongoose');
const Project = require('./Project');
const { request } = require('http');
const User = require('../User/User');  

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (Manager, Engineer)
exports.getAllProjects = async (req, res, next) => {
    // #swagger.tags = ['Project']
    try {
        const projects = await Project.find(req.query).populate('managerId', 'name email');
        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        next(error);
    }
};


exports.getAllManagerProjects = async (req, res, next) => {
    // #swagger.tags = ['Project']
    try {
         const allProjects = await Project.find(req.query)
            .populate('managerId', 'name email')
            .populate({
                path: 'teamMembers.member', // The path to the field you want to populate
                select: 'name email role seniority' // Select the fields you want from the User model
            });

        const managerProjects = allProjects.filter(p => p.managerId?._id?.toString() === req.user.id);

        res.status(200).json({ success: true, count: managerProjects.length, data: managerProjects });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private (Manager, Engineer)
exports.getProjectById = async (req, res, next) => {
    // #swagger.tags = ['Project']
    try {
       const project = await Project.findById(req.params.id)
            .populate('managerId', 'name email')
            .populate({
                path: 'teamMembers.member',
                select: 'name email role seniority'
            });

        if (!project) {
            return res.status(404).json({ success: false, message: `Project not found with id ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Manager)
exports.createProject = async (req, res, next) => {
    // #swagger.tags = ['Project']
    try {
        // Set the manager ID to the logged-in user
        req.body.managerId = req.user.id;
        const project = await Project.create(req.body);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a project
// @route   PATCH /api/projects/:id
// @access  Private (Manager)
exports.updateProject = async (req, res, next) => {
    // #swagger.tags = ['Project']
    try {
        console.log('Incoming request body:', req.body);
        
        let project = await Project.findById(req.params.id);
        if (!project) {
            console.log('Project not found');
            return res.status(404).json({ 
                success: false, 
                message: `Project not found with id ${req.params.id}` 
            });
        }

        // Check manager permission
        if (project.managerId.toString() !== req.user.id) {
            console.log('Permission denied - not manager');
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: You are not the manager of this project.' 
            });
        }

        // Prepare update data with date conversion
        const updateData = {
            ...req.body,
            ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
            ...(req.body.endDate && { endDate: new Date(req.body.endDate) })
        };

        console.log('Processed update data:', updateData);

        // Perform the update with proper validation context
        const updatedProject = await Project.findOneAndUpdate(
            { _id: req.params.id },
            updateData,
            {
                new: true,
                runValidators: true,
                context: 'query', // This is crucial
                // Add this to handle the validation properly
                setDefaultsOnInsert: true,
                overwrite: false
            }
        );

        if (!updatedProject) {
            throw new Error('Failed to update project');
        }

        console.log('Successfully updated project:', updatedProject);
        res.status(200).json({ 
            success: true, 
            data: updatedProject 
        });

    } catch (error) {
        console.error('Update error:', error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        // Handle other errors
        next(error);
    }
};
// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Manager)
exports.deleteProject = async (req, res, next) => {
    // #swagger.tags = ['Project']
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: `Project not found with id ${req.params.id}` });
        }
        // Ensure only the project manager can delete it
        if (project.managerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You are not the manager of this project.' });
        }

        // Also delete related assignments
        await mongoose.model('Assignment').deleteMany({ projectId: project._id });

        await project.remove();
        res.status(200).json({ success: true, message: 'Project and its assignments deleted successfully' });
    } catch (error) {
        next(error);
    }
};


exports.assignEngineerToProject = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { projectId } = req.params;
    const { engineerId, allocationPercentage, role } = req.body;

    // Validate input
    if (!engineerId || !mongoose.Types.ObjectId.isValid(engineerId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Valid engineer ID is required'
      });
    }

    // Check if engineer exists and is actually an engineer
    const engineer = await User.findById(engineerId).session(session);
    if (!engineer || engineer.role !== 'ENGINEER') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Specified user is not an engineer'
      });
    }

    // Get the project
    const project = await Project.findById(projectId).session(session);
    if (!project) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify requesting user is project manager
    if (project.managerId.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Only the project manager can assign engineers'
      });
    }

    // Check if engineer is already assigned
    const alreadyAssigned = project.teamMembers.some(member => 
      member.member.toString() === engineerId
    );
    
    if (alreadyAssigned) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Engineer is already assigned to this project'
      });
    }

    // Add to project team (this will trigger the User model validation)
    await project.addTeamMember(engineerId, allocationPercentage, role || 'developer');

    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Engineer assigned successfully',
      data: {
        projectId,
        engineerId,
        allocationPercentage,
        role
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error assigning engineer:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error assigning engineer'
    });
  } finally {
    session.endSession();
  }
};



// @desc    Get all projects for the logged-in user
// @route   GET /api/project/user
// @access  Private (Manager or Engineer)
exports.getUserProjects = async (req, res, next) => {
    // #swagger.tags = ['Project']
    try {
        // Find all projects where the teamMembers array contains an object
        // with a 'member' field matching the logged-in user's ID.
        const projects = await Project.find({ 'teamMembers.member': req.user.id })
            .populate('managerId', 'name email'); // You can add more populates if needed

        if (!projects) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        next(error);
    }
};