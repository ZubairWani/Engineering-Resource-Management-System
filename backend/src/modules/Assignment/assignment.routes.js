const express = require('express');
const {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment
} = require('./assignment.controller');
const { Authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(Authenticate);

router.route('/')
    .get(authorize('MANAGER', 'ENGINEER'), getAllAssignments)
    .post(authorize('MANAGER'), createAssignment);

router.route('/:id')
    .get(authorize('MANAGER', 'ENGINEER'), getAssignmentById)
    .patch(authorize('MANAGER'), updateAssignment)
    .delete(authorize('MANAGER'), deleteAssignment);

module.exports = router;