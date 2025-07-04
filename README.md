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

---

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

