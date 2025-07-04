const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
    {
        engineerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Engineer ID is required'],
            validate: {
                validator: async function (value) {
                    // Check if the engineer exists and has the ENGINEER role
                    const user = await mongoose.model('User').findOne({
                        _id: value,
                        role: 'ENGINEER',
                        isActive: true
                    });
                    return user !== null;
                },
                message: 'Engineer must exist, be active, and have the ENGINEER role'
            }
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project ID is required'],
            validate: {
                validator: async function (value) {
                    // Check if project exists and is either planning or active
                    const project = await mongoose.model('Project').findOne({
                        _id: value,
                        status: { $in: ['planning', 'active'] }
                    });
                    return project !== null;
                },
                message: 'Project must exist and be in planning or active status'
            }
        },
        allocationPercentage: {
            type: Number,
            required: [true, 'Allocation percentage is required'],
            min: [0, 'Allocation cannot be less than 0%'],
            max: [100, 'Allocation cannot exceed 100%'],
            validate: {
                validator: function (value) {
                    // Only allow multiples of 5 (optional)
                    return value % 5 === 0;
                },
                message: 'Allocation must be in 5% increments'
            }
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
            validate: {
                validator: async function (value) {
                    // Start date must be >= project start date
                    const project = await mongoose.model('Project').findById(this.projectId);
                    return value >= project.startDate;
                },
                message: 'Assignment cannot start before project start date'
            }
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
            validate: [
                {
                    validator: function (value) {
                        // End date must be after start date
                        return value > this.startDate;
                    },
                    message: 'End date must be after start date'
                },
                {
                    validator: async function (value) {
                        // End date must be <= project end date
                        const project = await mongoose.model('Project').findById(this.projectId);
                        return value <= project.endDate;
                    },
                    message: 'Assignment cannot end after project end date'
                }
            ]
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ['Developer', 'Tech Lead', 'QA Engineer', 'DevOps', 'Designer'],
                message: 'Invalid role. Must be one of: Developer, Tech Lead, QA Engineer, DevOps, Designer'
            },
            default: 'Developer'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound index to prevent duplicate assignments
assignmentSchema.index(
    { engineerId: 1, projectId: 1 },
    { unique: true, message: 'Engineer is already assigned to this project' }
);

// Indexes for query performance
assignmentSchema.index({ projectId: 1 });
assignmentSchema.index({ engineerId: 1 });
assignmentSchema.index({ startDate: 1 });
assignmentSchema.index({ endDate: 1 });

// Virtual populate for engineer details
assignmentSchema.virtual('engineer', {
    ref: 'User',
    localField: 'engineerId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for project details
assignmentSchema.virtual('project', {
    ref: 'Project',
    localField: 'projectId',
    foreignField: '_id',
    justOne: true
});
// Pre-save hook to validate engineer's total allocation
assignmentSchema.pre('save', async function (next) {
    // Only run validation if allocation is new or modified
    if (!this.isModified('allocationPercentage') && !this.isNew) {
        return next();
    }

    const engineer = await mongoose.model('User').findById(this.engineerId);
    if (!engineer) {
        // This case should be caught by field validator, but good to have
        throw new Error('Assigned engineer not found.');
    }

    // Find other current/future assignments for this engineer
    const otherAssignments = await mongoose.model('Assignment').find({
        engineerId: this.engineerId,
        _id: { $ne: this._id }, // Exclude the current document being saved
        endDate: { $gte: new Date() } // Only consider active or future assignments
    });

    const otherAllocationTotal = otherAssignments.reduce(
        (sum, assignment) => sum + assignment.allocationPercentage,
        0
    );

    const newTotalAllocation = otherAllocationTotal + this.allocationPercentage;

    if (newTotalAllocation > engineer.maxCapacity) {
        const err = new Error(
            `Assignment would exceed engineer's max capacity (${engineer.maxCapacity}%). ` +
            `Current allocation on other projects: ${otherAllocationTotal}%. ` +
            `This assignment requires: ${this.allocationPercentage}%.`
        );
        return next(err);
    }
    
    next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;