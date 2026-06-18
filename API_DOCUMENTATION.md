# 🚀 Dual DB Synchronization System - API Documentation

Welcome to the API specification for the User Authentication and Cross-Database Sync Engine. This backend is designed using **Clean Architecture** patterns, ensuring high decoupling between our Express interfaces, Prisma Core (MySQL), and secondary Mongo Sync collections using RabbitMQ event messaging loops.

---

## 🗺️ System Overview & Base URLs

- **Local Server Port:** `http://localhost:3000`
- **Global Headers Required:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` *(For all protected paths)*

---

## 🛠️ System Technology Stack & Patterns

This project relies on a modern enterprise stack designed around **SOLID OOP principles** and **Clean Architecture** boundaries.

### 🧱 Core Architecture & Database Engines
- **TypeScript & Node.js:** Pure Object-Oriented patterns utilizing strong contracts, interfaces, and Dependency Injection.
- **Prisma ORM (MySQL):** Serves as our **Primary Write Database** (Relational). All user registrations, profile updates, and active states originate here.
- **Mongoose (MongoDB):** Serves as our **Secondary Sync Database** (NoSQL). Optimized for read operations and isolated from write traffic.

### 📬 Asynchronous Messaging & Synchronization
- **RabbitMQ (`amqplib`):** The backbone of our event-driven system. It decouples our API from database syncing using an exchange and queue network (`user_sync_queue`).
  - **CREATE:** Registers user copies into MongoDB.
  - **UPDATE:** Modifies records and handles active block state enforcement.
  - **DELETE:** Synchronously purges document states across both environments.

### 🛡️ Security Framework
- **JSON Web Tokens (`jsonwebtoken`):** Stateless bearer token verification containing encrypted structural payloads (`id`, `email`, `role`).
- **Bcrypt Hashing (`bcrypt`):** Handles irreversible password salting and verification before database tracking.

## 🚪 1. Authentication Endpoints (`/auth`)

Public entry paths handled outside structural session loops.

### 👤 A. Register Account
Creates a primary record in MySQL, hashes the credential package using `bcrypt`, and publishes an initialization payload to RabbitMQ to mirror the data into MongoDB.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body Configuration:**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "securepassword123",
    "role": "user" 
  }
(Note: role defaults to "user" if omitted. Set to "admin" to unlock master metrics).

Success Response (201 Created):

JSON
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "role": "user",
    "isBlocked": false,
    "createdAt": "2026-06-19T01:30:00.000Z"
  }
}
Error Responses:

400 Bad Request : {"success": false, "message": "User already exists"}

🔑 B. User Login
Validates password strings against secure relational records and generates a signed JWT payload.

URL: /auth/login

Method: POST

Auth Required: No

Request Body Configuration:

JSON
{
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
Success Response (200 OK):

JSON
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIifQ..."
}
Error Responses:

401 Unauthorized : {"success": false, "message": "Invalid credentials."}

403 Forbidden : {"success": false, "message": "Your account has been deactivated by an admin."}

👤 2. User Domain Endpoints (/user)
Endpoints reserved for authenticated accounts.

📋 A. Get Active Profile
Queries live SQL states using the JWT context footprint. Instantly intercepts and blocks connections if the account status flips to blocked.

URL: /user/profile

Method: GET

Headers: Authorization: Bearer <TOKEN>

Success Response (200 OK):

JSON
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "role": "user",
    "isBlocked": false,
    "createdAt": "2026-06-19T01:30:00.000Z"
  }
}
Error Responses:

401 Unauthorized : {"success": false, "message": "Invalid Token."}

403 Forbidden : {"success": false, "message": "Access denied. Your account is blocked."}

🔑 3. Admin Control Board (/admin)
Strictly guarded endpoints. Access requires a valid token where role === "admin".

🗄️ A. Read All SQL Users (Primary MySQL)
URL: /admin/users/sql

Method: GET

Success Response (200 OK): An array of all user records stored inside MySQL.

🍃 B. Read All Synced Users (Secondary MongoDB)
Useful to inspect if RabbitMQ synchronization hooks are functional.

URL: /admin/users/mongo

Method: GET

Success Response (200 OK):

JSON
[
  {
    "sqlId": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "role": "user",
    "isBlocked": false,
    "createdAt": "2026-06-19T01:30:00.000Z"
  }
]
✏️ C. Update User Profile & Block State
Modifies configurations inside MySQL and transmits an asynchronous UPDATE event via RabbitMQ to update MongoDB.

URL: /admin/users/:id

Method: PUT

Request Body Configuration:

JSON
{
  "name": "John Doe Updated",
  "isBlocked": true
}
Success Response (200 OK): Returns the modified structural entity object.

🗑️ D. Delete User Account
Purges a user account from MySQL and streams a DELETE action flag via RabbitMQ to drop the associated document inside MongoDB.

URL: /admin/users/:id

Method: DELETE

Success Response (200 OK):

JSON
{
  "success": true,
  "message": "Deleted successfully."
}
