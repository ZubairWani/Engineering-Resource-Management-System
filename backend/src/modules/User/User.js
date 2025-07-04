const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false, // Don't send password back in queries by default
        },
        role: {
            type: String,
            enum: ['ENGINEER', 'MANAGER'],
            required: true,
            default: 'ENGINEER',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        seniority: {
            type: String,
            enum: ['junior', 'mid', 'senior'],
            required: true,
            default: 'junior',
        },
        // Max capacity in percentage for an engineer
        maxCapacity: {
            type: Number,
            default: 100,
            min: 0,
            max: 100,
        },
        skills: {
            type: [String],
            default: []
        },
        passwordResetToken: String,
        passwordResetExpires: Date,

        projects: [{
            project: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Project'
            },
            // In your User schema
            allocation: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
                validate: {
                    validator: function (value) {
                        // Get the parent document (user)
                        const userDoc = this.parent();
                        if (!userDoc) return true; // Skip validation if no parent

                        // Calculate total allocation excluding current project being validated
                        const currentProjects = userDoc.projects || [];
                        const currentProjectId = this.parent().project; // The project being validated

                        const totalAllocation = currentProjects.reduce((sum, p) => {
                            // Skip the current project being validated
                            if (p.project && currentProjectId && p.project.equals(currentProjectId)) {
                                return sum;
                            }
                            return sum + (p.allocation || 0);
                        }, 0);

                        return (totalAllocation + value) <= userDoc.maxCapacity;
                    },
                    message: 'Total project allocation cannot exceed user max capacity'
                }
            },
            roleInProject: {
                type: String,
                enum: ['developer', 'lead', 'architect', 'qa'],
                default: 'developer'
            }
        }]
    },
    {
        timestamps: true,
    }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to generate JWT
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

// Method to compare entered password with hashed password
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Method to add a project to user's project list
userSchema.methods.addProject = async function (projectId, allocation, roleInProject = 'developer') {
    // Check if already assigned
    if (this.projects.some(p => p.project.equals(projectId))) {
        throw new Error('User is already assigned to this project');
    }

    // Check capacity
    const totalAllocation = this.projects.reduce((sum, p) => sum + p.allocation, 0);
    if (totalAllocation + allocation > this.maxCapacity) {
        throw new Error('Assignment would exceed user capacity');
    }

    this.projects.push({ project: projectId, allocation, roleInProject });
    await this.save();

    // Add user to project's team
    const project = await mongoose.model('Project').findById(projectId);
    project.teamMembers.push({ member: this._id, allocation, roleInProject });
    await project.save();

    return this;
};

// Method to remove a project from user's list
userSchema.methods.removeProject = async function (projectId) {
    const projectIndex = this.projects.findIndex(p => p.project.equals(projectId));
    if (projectIndex === -1) {
        throw new Error('User is not assigned to this project');
    }

    this.projects.splice(projectIndex, 1);
    await this.save();

    // Remove user from project's team
    const project = await mongoose.model('Project').findById(projectId);
    project.teamMembers = project.teamMembers.filter(m => !m.member.equals(this._id));
    await project.save();

    return this;
};


const User = mongoose.model('User', userSchema);

module.exports = User;