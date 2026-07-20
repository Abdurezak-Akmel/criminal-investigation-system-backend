# Criminal Investigation System Backend

## Overview

This backend powers a full-stack criminal investigation management system designed to help investigators, case officers, and administrators manage cases, evidence, chain-of-custody records, and user access in a structured and secure manner.

The API serves as the core business logic layer for the application, handling authentication, role-based access, case management, evidence tracking, reporting, and administrative operations.

## Main Purpose

This project is built to support:

- secure user registration and authentication
- role-based access for submitters, referees, and administrators
- case record management
- evidence management and upload handling
- chain-of-custody tracking
- admin operations and user management
- email-based verification and password reset flows

## What the Backend Serves For

The backend exposes a RESTful API for the frontend application and provides the data persistence and business rules needed for the investigation workflow.

It is intended for use in systems where investigators must:

- create and track criminal cases
- document and organize evidence
- maintain audit trails for evidence movement and custody
- manage users and permissions securely

## Project Structure

```text
backend/
  src/
    app.js
    config/
      db.js
      seed.js
    middleware/
      adminMiddleware.js
      authMiddleware.js
      errorMiddleware.js
    modules/
      admin/
      auth/
      cases/
      chain-of-custody/
      evidences/
      users/
    utils/
      asyncHandler.js
      email.js
      jwt.js
```

## Core Features

### Authentication and Authorization

- user registration
- email verification
- login with JWT-based authentication
- password reset flow
- admin invitation flow
- admin-only routes protected by middleware

### User Management

- create, read, update, and delete users
- role-based access control
- user activation and verification status tracking

### Case Management

- create and manage investigation cases
- organize case-related data and workflow actions

### Evidence Management

- evidence records and storage handling
- support for file uploads and evidence-related operations

### Chain of Custody

- track movement and custody status of evidence

### Admin Operations

- admin seeding on startup
- privileged administrative endpoints

## Tech Stack

### Runtime and Framework

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose ODM

### Authentication and Security

- JSON Web Tokens (jsonwebtoken)
- bcryptjs for password hashing
- dotenv for environment configuration
- CORS support

### File and Email Handling

- multer for file uploads
- nodemailer for email delivery

### Development Tools

- nodemon for development auto-restart

## Environment Variables

Create a .env file in the backend directory with the following values:

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/criminal-investigation-system

JWT_SECRET=your_jwt_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
BASE_URL=http://localhost:3000/api/auth
API_BASE_URL=http://localhost:3000

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

### Notes

- Make sure MongoDB is running before starting the server.
- For Gmail-based SMTP, use an app password if 2-factor authentication is enabled.
- The BASE_URL and API_BASE_URL values should be adjusted to your deployment environment if needed.

## Installation and Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a .env file in the backend folder and fill in the required variables as shown above.

### 3. Start MongoDB

Ensure your MongoDB instance is running locally or update MONGODB_URI to point to your remote database.

### 4. Start the development server

```bash
npm run dev
```

The server will run on the default port 3000 unless you override it with PORT in your .env file.

## Startup Behavior

When the server starts:

- it connects to MongoDB
- it seeds an admin account using the values from ADMIN_EMAIL and ADMIN_PASSWORD
- it starts the API server and listens for requests

## API Overview

The backend exposes endpoints under the following base paths:

- /api/auth for authentication-related routes
- /api/admin for admin operations
- /api/users for user CRUD operations
- /api/cases for case management
- /api/chain-of-custody for chain-of-custody workflows
- /api/evidence for evidence operations
- /api/reports for reporting endpoints

## Authentication Flow

The authentication system supports:

- registration
- verification via email token
- login
- password reset request
- password reset confirmation

JWT tokens are issued after successful login and are used to protect authenticated routes.

## Admin Access

Certain routes are restricted to admin or privileged users using middleware. The backend expects the authenticated user's role to be included in the issued JWT.

## Data Model Notes

The core user model includes:

- email
- passwordHash
- role
- fullName
- badgeNumber
- agencyDepartment
- contactPhone
- isActive
- isVerified

This model is used by the authentication and user-management modules.

## Development Notes

- The project uses ES modules (type: module).
- The main entry point is src/app.js.
- The codebase is organized by feature modules under src/modules.
- Error handling is centralized through middleware.

## Production Considerations

Before deploying to production, consider:

- securing your JWT secret
- using a real SMTP provider and app password
- configuring a production MongoDB instance
- enabling HTTPS and proper CORS policies
- adding rate limiting and request validation
- replacing placeholder or development values in the environment file

## Recommended Next Improvements

Possible enhancements for the project include:

- input validation with Joi or express-validator
- pagination and filtering for list endpoints
- richer audit logging
- file upload storage integration with cloud storage
- automated tests
- API documentation with Swagger or OpenAPI
