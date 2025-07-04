
const express = require('express');
const {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    assignEngineerToProject,
    getAllManagerProjects,
    getUserProjects
} = require('./project.controller');
const { Authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(Authenticate);

router.get('/user', getUserProjects);


router.post(
  '/:projectId/assign',
  authorize('MANAGER'),   
  assignEngineerToProject
);

router.get(
  '/manager',
  authorize('MANAGER'), getAllManagerProjects
);



router.route('/')
    .get(authorize('MANAGER', 'ENGINEER'), getAllProjects)
    .post(authorize('MANAGER'), createProject);

router.route('/:id')
    .get(authorize('MANAGER', 'ENGINEER'), getProjectById)
    .patch(authorize('MANAGER'), updateProject)
    .delete(authorize('MANAGER'), deleteProject);

module.exports = router;