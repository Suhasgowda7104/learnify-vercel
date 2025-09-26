<div align="center">
  <div>
    <img src="https://img.shields.io/badge/-Angular-black?style=for-the-badge&logoColor=white&logo=angular&color=DD0031" alt="angular" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Node.js-black?style=for-the-badge&logoColor=white&logo=nodedotjs&color=339933" alt="nodejs" />
    <img src="https://img.shields.io/badge/-Express.js-black?style=for-the-badge&logoColor=white&logo=express&color=000000" alt="expressjs" />
    <img src="https://img.shields.io/badge/-PostgreSQL-black?style=for-the-badge&logoColor=white&logo=postgresql&color=336791" alt="postgresql" />
    <img src="https://img.shields.io/badge/-Docker-black?style=for-the-badge&logoColor=white&logo=docker&color=2496ED" alt="docker" />
  </div>

  <h1 align="center">Learnify</h1>
  <h3 align="center">A Learning Management System</h3>
</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🏗️ [Project Structure](#project-structure)
6. 📝 [API Endpoints](#api-endpoints)
7. 🧪 [Testing](#testing)
8. 🐳 [Docker Setup](#docker-setup)
9. 🚀 [Deployment](#deployment)

## <a name="introduction">🤖 Introduction</a>

Learnify is a comprehensive Learning Management System (LMS) that enables educational institutions and instructors to create, manage, and deliver online courses. The platform provides separate interfaces for administrators to manage courses and students to enroll and access learning materials.

## <a name="tech-stack">⚙️ Tech Stack</a>

### Backend
- Node.js
- Express.js
- PostgreSQL with Sequelize ORM
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation
- Jest for testing

### Frontend
- Angular 19
- TypeScript
- RxJS for reactive programming
- Angular Router for navigation
- Angular Forms (Reactive Forms)
- Jasmine & Karma for testing

## <a name="features">🔋 Features</a>

👉 **User Authentication**: Secure registration and login system integrated with JWT tokens

👉 **Role-Based Access Control**: Separate dashboards and permissions for administrators and students

👉 **Course Management**: Administrators can create, update, delete, and manage courses with content

👉 **Student Enrollment**: Students can browse available courses and enroll to them

👉 **Dashboard Analytics**: Admin dashboard with course statistics and enrollment tracking

👉 **User Management**: Track enrolled users and course participation

👉 **Responsive Design**: Modern and clean UI with Dynamic content loading

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following is installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v18 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [PostgreSQL](https://www.postgresql.org/) (Local or cloud instance)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

**Cloning the Repository**

```bash
git clone https://github.com/Suhasgowda7104/learnify.git
cd learnify
```

**Backend Setup**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with the following variables
# Copy from .env.example and update with your values
cp .env.example .env

# Update .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=learnify_db
# DB_USER=your_username
# DB_PASSWORD=your_password
# PORT=5000
# NODE_ENV=development

# Run database migrations (if available)
npm run migrate

# Start the server
npm run dev
```

**Frontend Setup**

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Start the development server
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser to view the project.

The backend API will be running on [http://localhost:5000](http://localhost:5000).

## <a name="project-structure">🏗️ Project Structure</a>

### Backend

```
server/
├── config/             # Database configuration
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middlewares
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   └── utils/          # Utility functions
├── migrations/         # Database migrations
├── index.js            # Entry point
└── .env.example        # Environment variables template
```

### Frontend

```
client/
├── src/
│   ├── app/
│   │   ├── admin/      # Admin module components
│   │   ├── auth/       # Authentication components
│   │   ├── services/   # Angular services
│   │   ├── shared/     # Shared components
│   │   ├── student/    # Student module components
│   │   └── app.module.ts
│   └── environments/   # Environment configurations
├── angular.json        # Angular configuration
└── package.json        # Dependencies
```

## <a name="api-endpoints">📝 API Endpoints</a>

### Authentication Routes

- `POST /api/v1/auth/register` - Register a new user (student)
- `POST /api/v1/auth/login` - Authenticate user and return JWT
- `POST /api/v1/auth/logout` - Logout user

### Course Routes (Public)

- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get specific course details
- `GET /api/v1/courses/:id/content` - Get course content

### Admin Routes (Protected)

- `POST /api/v1/admin/courses` - Create a new course
- `PUT /api/v1/admin/courses/:id` - Update course
- `DELETE /api/v1/admin/courses/:id` - Delete course
- `GET /api/v1/admin/enrollments/:courseId` - Get course enrollments
- `GET /api/v1/admin/courses/:courseId/enrollment-count` - Get enrollment count
- `GET /api/v1/admin/courses/:courseId/users` - Get enrolled users

### Student Routes (Protected)

- `GET /api/v1/student/courses` - Get available courses for students
- `GET /api/v1/student/courses/:id` - Get course details for students

### Enrollment Routes (Protected)

- `POST /api/v1/enrollments/courses/:id/enroll` - Enroll in a course
- `GET /api/v1/enrollments/enrollments` - Get student's enrollments

### Health Check

- `GET /api/v1/health` - API health check endpoint

---

**Note**: All protected routes require a valid JWT token in the Authorization header: `Bearer <token>`

## 🧪 Testing

### Backend Testing

```bash
cd server
npm test
```

### Frontend Testing

```bash
cd client
ng test
```

## <a name="docker-setup">🐳 Docker Setup</a>

Run the Learnify application using Docker and Docker Compose for a containerized development environment.

**Prerequisites**

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Docker Compose (included with Docker Desktop)

**Quick Docker Start**

```bash
# Clone the repository (if not already done)
git clone https://github.com/Suhasgowda7104/learnify.git
cd learnify

# Start all services with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:8081
# Backend API: http://localhost:5000
# Database: localhost:5432

# Stop all services
docker-compose down
```

**Docker Architecture**

👉 **Client (Angular + Nginx)**: Frontend application containerized with optimized production build

👉 **Server (Node.js)**: Backend API with health checks and non-root user security

👉 **Database Connection**: Connects to your local PostgreSQL database using `host.docker.internal`

👉 **Network**: All services communicate through `learnify-network` with internal DNS resolution

**Docker Commands**

```bash
# View logs for all services
docker-compose logs -f

# Rebuild and start services
docker-compose up --build

# View container status
docker-compose ps

# Restart a specific service
docker-compose restart server

# Remove containers and volumes (careful: deletes data)
docker-compose down -v
```

## 🚀 Deployment

### Backend Deployment

1. Set up a PostgreSQL database
2. Configure environment variables for production
3. Deploy to your preferred platform (GCP, AWS, etc.)

### Frontend Deployment

1. Build the Angular application:
   ```bash
   ng build --prod
   ```
2. Deploy the `dist/` folder to your web server

---

<div align="center">
  <p>Built using Angular and Node.js</p>
</div>