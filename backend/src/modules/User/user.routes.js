const express = require('express');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllEngineers
} = require('./user.controller');
const { Authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();


router.use(Authenticate);
router.get("/engineers" , authorize('MANAGER'), getAllEngineers)  

router.route('/')
    .get(authorize('MANAGER'), getAllUsers)
    .post(authorize('MANAGER'), createUser);
    

router.route('/:id')
    .get(authorize('MANAGER', 'ENGINEER'), getUserById)
    .patch(authorize('MANAGER', 'ENGINEER'), updateUser) 
    .delete(authorize('MANAGER'), deleteUser);
    

    
  

module.exports = router;