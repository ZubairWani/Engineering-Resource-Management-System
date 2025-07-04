const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
            maxlength: [100, 'Project name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
            validate: {
                validator: function (value) {
                    // Start date shouldn't be in the past (optional)
                    return value >= new Date();
                },
                message: 'Start date cannot be in the past'
            }
        },

        // Update the endDate validation in your project schema
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
            validate: {
                validator: function (value) {
                    // For updates, we need to handle both cases:
                    // 1. When updating both dates
                    // 2. When updating just endDate
                    const startDate = this.startDate || (this._update && this._update.$set && this._update.$set.startDate);
                    return value > startDate;
                },
                message: 'End date must be after start date'
            }
        },

        requiredSkills: {
            type: [String],
            required: [true, 'At least one skill is required'],
            validate: {
                validator: function (skills) {
                    return skills.length > 0 && skills.every(skill => skill.trim().length > 0);
                },
                message: 'At least one valid skill is required'
            }
        },
        teamSize: {
            type: Number,
            min: [1, 'Team size must be at least 1'],
            max: [20, 'Team size cannot exceed 20'] // Adjust max as needed
        },
        status: {
            type: String,
            enum: {
                values: ['planning', 'active', 'completed'],
                message: 'Status must be either planning, active, or completed'
            },
            default: 'planning'
        },
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Manager ID is required'],
            validate: {
                validator: async function (value) {
                    // Check if the manager exists and has the MANAGER role
                    const user = await mongoose.model('User').findOne({ _id: value, role: 'MANAGER' });
                    return user !== null;
                },
                message: 'Manager must exist and have the MANAGER role'
            }
        },

        teamMembers: [{
            member: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            allocation: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            roleInProject: {
                type: String,
                enum: ['developer', 'lead', 'architect', 'qa'],
                default: 'developer'
            }
        },
        { _id: false }
        ]
    },


    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better query performance
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ status: 1 });
projectSchema.index({ managerId: 1 });


// Add this to your Project schema methods
projectSchema.methods.remove = async function () {
    // Remove this project from all assigned users
    const userIds = this.teamMembers.map(member => member.member);

    // Use bulk operations for better performance with many users
    await mongoose.model('User').updateMany(
        { _id: { $in: userIds } },
        { $pull: { projects: { project: this._id } } }
    );

    // Now delete the project
    await this.deleteOne();

    return this;
};

// Method to add a user to project team
projectSchema.methods.addTeamMember = async function (userId, allocation, roleInProject = 'developer', session = null) {
    // Check if already in team
    if (this.teamMembers.some(m => m.member.equals(userId))) {
        throw new Error('User is already in project team');
    }

    // Add to project team
    this.teamMembers.push({ member: userId, allocation, roleInProject });
    await this.save({ session });

    // Add project to user's project list
    const user = await mongoose.model('User').findById(userId).session(session);
    if (!user.projects) user.projects = [];
    user.projects.push({
        project: this._id,
        allocation,
        roleInProject
    });

    await user.save({ session });

    return this;
};

// Method to remove a user from project team
projectSchema.methods.removeTeamMember = async function (userId) {
    const memberIndex = this.teamMembers.findIndex(m => m.member.equals(userId));
    if (memberIndex === -1) {
        throw new Error('User is not in project team');
    }

    this.teamMembers.splice(memberIndex, 1);
    await this.save();

    // Remove project from user's project list
    const user = await mongoose.model('User').findById(userId);
    await user.removeProject(this._id);

    return this;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;