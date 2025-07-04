# Engineering Resource Management System

A full-stack application designed to provide managers with a powerful tool to track engineering team assignments, manage project allocations, and plan for future resource needs. This system offers a clear overview of team capacity, individual workloads, and project requirements.

-------------------

## ✨ Core Features

### For Managers
-   **Interactive Dashboard:** A command center with at-a-glance stats on total engineers, active projects, and team capacity. Features an analytics chart for team utilization.
-   **Team Overview:** View all engineers, their skills, current workload allocation, and availability status (e.g., Overloaded, Underutilized).
-   **Project Management (Full CRUD):**
    -   **Create:** Add new projects with details like name, description, required skills, and status.
    -   **Read:** View all projects in a clean, card-based layout.
    -   **Update:** Edit existing project details.
    -   **Delete:** Remove projects with a confirmation dialog.
-   **Assignment System:** Assign engineers to projects directly from the project management view.
-   **Engineer Onboarding:** Add new engineers to the team directly from the Engineers page.
-   **Search & Filter:** Easily find engineers by name or skill.

### For Engineers
-   **Personalized Dashboard:** A clear view of **"My Current Projects"** and **"Upcoming Assignments"**.
-   **Profile Management:** View and update personal details, including skills, seniority, and employment type (full-time/part-time).

### Bonus Features
-   **Assignments Timeline:** A Gantt-style chart providing a visual overview of all project timelines and engineer assignments.
-   **Skill Gap Analysis:** An intelligent card on the Manager Dashboard that identifies skills required by projects but not currently present in the team, highlighting hiring or training needs.

------------------


## 🤖 AI-Powered Development Approach

This project was not just built *with* AI, but was architected from the ground up using an **AI-first workflow**. The goal was to leverage AI as a productivity multiplier at every stage, from initial project scaffolding to complex business logic implementation and debugging.

### AI Tools Used

-   **Google AI Studio (Gemini Pro):** Served as the primary "solution architect" and "senior developer." Used for high-level tasks like generating the initial project scaffolding scripts, architecting the React Context state management, creating complex components with multiple states, and refactoring code for better readability and performance.

-   **GitHub Copilot:** Acted as the real-time "pair programmer" within the IDE. It was invaluable for autocompleting boilerplate, writing utility functions, and reducing the cognitive load of manual typing, allowing for a greater focus on the overall application logic.

-   **General AI Assistants (ChatGPT/Claude):** Used for quick queries, documentation lookups, and generating smaller, self-contained code snippets (e.g., a specific Zod schema or a Tailwind CSS class combination).

### A Structured, AI-First Workflow

The development followed a deliberate, multi-phase process where AI was a partner at each step:

#### **Phase 1: Automated Project Scaffolding**
Instead of setting up the frontend and backend manually, a detailed prompt was given to **Google AI Studio** to automate the entire process.

-   **The Prompt:** *"Generate two separate bash scripts. The first (`setup-frontend.sh`) should create a Vite project with React and TypeScript, then install and configure Tailwind CSS and ShadCN UI. The second (`setup-backend.sh`) should use the NestJS CLI to create a new project, then install dependencies for Mongoose, JWT authentication, and configuration management."*

-   **The Result:** This produced executable scripts that built a consistent, error-free development environment in seconds. This declarative approach to setup ensured a perfect starting point.

#### **Phase 2: Architectural Blueprint and Code Generation**
With the projects scaffolded, AI was used to lay out the application's structure.

1.  **Folder Structure:** I described the application's features to the AI and asked it to generate a logical and scalable folder structure (`/pages`, `/components`, `/hooks`, `/lib`, `/store`, etc.). This served as the blueprint for the entire frontend.
2.  **Boilerplate Generation:** The AI was then tasked with populating this structure with placeholder component files, each containing the basic React component boilerplate.
3.  **Complex Component Logic:** For key components like the `ProfilePage`, the AI was given the task: *"Create a React component that displays user data and includes a form for updating skills using a tag-based input system. The component should manage its own state for the input field and the list of skill tags."* This resulted in a robust, pre-built component that was then integrated and styled.

#### **Phase 3: Database Seeding and Debugging**
-   **Database Seeding Script:** The comprehensive `seed.js` script was a key area of AI collaboration. I provided the data requirements (e.g., "3-4 engineers with different capacities," "6-8 assignments showing overloaded/underutilized scenarios"), and the AI generated the full script.
-   **Iterative Debugging:** The most significant AI contribution was in the **debugging cycle of the seed script**. When Mongoose returned specific validation errors (e.g., `startDate cannot be in the past`, `role is not a valid enum value`), the full error message and the relevant code were provided to the AI. It was able to instantly identify the root cause (timezone issues, case sensitivity, data inconsistencies) and provide the exact, corrected code, turning what could have been hours of debugging into a few minutes of refinement.

### Challenges and Resolutions
-   **Challenge:** The initial AI-generated setup script for the frontend installed a version of Vite that was incompatible with the system's Node.js version, leading to a cryptic `crypto.hash` error.
-   **Resolution:** The error message was fed back to the AI, which correctly diagnosed the Node.js version conflict and provided the exact steps to resolve it by updating the Node environment. This demonstrated the power of AI in solving environment-specific configuration issues.

-   **Challenge:** AI-generated code, while often functional, sometimes lacked professional polish or missed subtle edge cases.
-   **Resolution:** Every AI-generated block of code was treated as a "first draft." A critical human review was always performed to refactor, style, and test the code against the project's specific UX/UI goals. This human-in-the-loop approach ensured high quality.

### Validation Approach
The guiding principle was to use AI as a highly skilled assistant, not a replacement for development expertise. The primary validation method was to **understand the intent and logic** of every line of code suggested by the AI. This deep technical comprehension was essential for effective debugging, customization, and ensuring the final application was not a "black box" but a well-architected and maintainable system.

-------------------

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript, Vite, Tailwind CSS, ShadCN UI
-   **State Management:** React Context API with `useReducer`
-   **Forms:** React Hook Form with Zod for validation
-   **Charting:** ApexCharts
-   **Backend:** Node.js, Express.js (or NestJS), Mongoose
-   **Database:** MongoDB
-   **Authentication:** JWT (JSON Web Tokens)

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   [MongoDB](https://www.mongodb.com/try/download/community) installed locally or a connection string from MongoDB Atlas.

### 1. Backend Setup

First, set up the server and seed the database.

1.  **Navigate to the `backend` directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a new file named `.env` in the `backend` directory.
    -   Copy the content from `.env.example` (if it exists) or use the template below.
    -   **Important:** Replace `your_mongodb_connection_string_here` with your actual MongoDB connection URL.

    ```env
    # .env
    MONGODB_URL="your_mongodb_connection_string_here"
    BACKEND_PORT=8081
    NODE_ENV="development"
    JWT_SECRET="a-very-strong-secret-key-for-development"
    ```

4.  **Seed the database:**
    -   This command will clear the database and populate it with sample users, projects, and assignments.
    ```bash
    npm run seed
    ```

5.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The server should now be running on `http://localhost:8081`.

### 2. Frontend Setup

Next, set up the React client.

1.  **Open a new terminal** and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The application should now be running and accessible at `http://localhost:5173` (or another port if 5173 is busy).

---

## 📋 How to Use the Application

The database is seeded with pre-defined users to allow for easy testing of both roles.

### Login Credentials

Use the following credentials on the login page:

| Role      | Email               | Password      | Notes                                                                |
|-----------|---------------------|---------------|----------------------------------------------------------------------|
| **Manager**   | `manager@test.com`  | `manager123`  | Has full access to dashboards, projects, engineers, and timeline.     |
| **Engineer**  | `senior@test.com`   | `engineer123` | Can view their assignments and edit their profile.                   |
| **Engineer**  | `junior@test.com`   | `engineer123` | A part-time engineer to test capacity calculations.                  |
| **Engineer**  | `zubairwani49@gmail.com`   | `password123` | A Full-time engineer to test capacity calculations.                  |



**Note:** When you create a **new engineer** from the manager dashboard, they are automatically assigned the password **`password123`** and can be used for login.


--------------------------------------------------------------------------------------

To use swagger ui
    - run command
        -- node swagger.js

