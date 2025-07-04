const authRoutes = require('../src/modules/Auth/routes/auth.routes.js');
const userRoutes = require('../src/modules/User/user.routes.js');
const projectRoutes = require('../src/modules/Project/project.routes');
const assignmentRoutes = require('../src/modules/Assignment/assignment.routes');

const configureRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/project', projectRoutes);
    app.use('/api/assignment', assignmentRoutes);
}

module.exports = configureRoutes;