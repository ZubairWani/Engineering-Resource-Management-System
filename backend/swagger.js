const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "Resource Management System Backend",
        description: "Docs for all the API's"
    },
    host: "localhost:8081",
    schemes: ["http"],
    tags: [
        { name: "Auth", description: "All the Api's related to Authentications" },
        { name: "User", description: "All the Api's related to Users" },
        { name: "Project", description: "All the Api's related to Projects" },
        { name: "Assignment", description: "All the Api's related to Assignments" },
    ]
};

const outputFile = "./swagger-output.json";
const routes = ["./src/routes.config.js"];

swaggerAutogen(outputFile, routes, doc);
