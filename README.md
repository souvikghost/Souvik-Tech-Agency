# Souvik Tech Agency — Backend API

> REST API for a role-based software company management portal. Built with Node.js, Express, and MongoDB. Deployed on AWS EC2 with PM2 for 24/7 uptime.

🔗 **Live Demo:** [https://souviktechagency.vercel.app](https://souviktechagency.vercel.app)  
🔗 **Frontend Repo:** [https://github.com/souvikghost/Souvik-Tech-Agency-Frontend](https://github.com/souvikghost/Souvik-Tech-Agency-Frontend)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Test Credentials](#test-credentials)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT via httpOnly Cookie |
| Password Hashing | bcrypt |
| File Upload | Multer (memory storage) + Cloudinary |
| Process Manager | PM2 (production) |
| Hosting | AWS EC2 |

---

## Features

- Role-based access control — Admin, Employee, Client
- JWT authentication via secure httpOnly cookies with cross-origin support
- Soft delete for users — records preserved with `isDeleted` flag, excluded from active queries
- Service request flow — Client requests → Admin approves → Project auto-created
- Employee assignment to projects (admin only, employees cannot unassign themselves)
- Messaging system between all roles with conversation and thread management
- Avatar upload via Cloudinary with automatic face-crop transformation (200×200)
- Dashboard stats endpoint for admin overview
- CORS configured for cross-origin cookie support between Vercel frontend and EC2 backend
- Payment management — admin can add, edit, delete payment records per project (amount, method, status, date, notes)
- Soft-deleted users blocked from login — returns invalid credentials instead of allowing access

---

## Getting Started


### Installation

```bash
# Clone the repository
git clone https://github.com/souvikghost/Souvik-Tech-Agency
cd Souvik-Tech-Agency

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=9797
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/souvik-tech-agency
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> For production set `NODE_ENV=production` — this automatically enables `secure: true` and `sameSite: None` on the auth cookie for cross-origin support.

### Run Locally

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server starts at `http://localhost:9797`

---

## Admin Seeding

There is no self-registration. The admin account is seeded manually. The admin for the live demo has already been seeded manually and is ready to use with the credentials below.

---

## Project Structure

```
├── config/
│   ├── db.js                        # MongoDB connection setup
│   ├── cloudinary.js                # Cloudinary SDK configuration
│   └── multer.js                    # Multer memory storage + file filter
├── controllers/
│   ├── auth.controller.js           # login, logout, getMe
│   ├── user.controller.js           # createUser, getUsers, soft deleteUser, updateProfile
│   ├── service.controller.js        # createService, getServices, deleteService
│   ├── serviceRequest.controller.js # createRequest, getRequests, approveRequest, rejectRequest
│   ├── project.controller.js        # getProjects, assignEmployees, updateStatus, deleteProject
│   ├── message.controller.js        # getConversations, getContacts, getThread, sendMessage, deleteConversation
│   ├── payment.controller.js        # createPayment, getPayments, getPaymentByProject, updatePayment, deletePayment, getPaymentStats
│   └── dashboard.controller.js      # getDashboardStats
├── middleware/
│   ├── protect.js                   # JWT verification — attaches req.user
│   └── allowRoles.js                # Role-based access guard
├── models/
│   ├── userModel.js                 # User schema with bcrypt hook + isDeleted soft delete
│   ├── projectModel.js              # Project schema
│   ├── serviceModel.js              # Service schema with price field
│   ├── serviceRequest.js            # Service request schema
│   ├── messageModel.js              # Message schema with read status
│   └── paymentModel.js              # Payment schema linked to project and client
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── serviceRoutes.js
│   ├── projectRoutes.js
│   ├── dashboardRoutes.js
│   ├── messageRoutes.js
│   └── payment.routes.js
├── app.js                           # Express app — CORS, middleware, route registration
└── server.js                        # Entry point — DB connect + server listen
```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login with email + password, sets httpOnly cookie |
| POST | `/api/auth/logout` | Any | Clears auth cookie |
| GET | `/api/auth/me` | Any | Returns current logged-in user |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/users` | Admin | Create employee or client |
| GET | `/api/users` | Admin | Get all active users — filter by `?role=employee\|client` |
| GET | `/api/users?deleted=true` | Admin | Get soft-deleted users |
| GET | `/api/users/:id` | Admin | Get single user by ID |
| DELETE | `/api/users/:id` | Admin | Soft delete — sets `isDeleted: true` |
| PATCH | `/api/users/profile` | Any | Update own name and/or avatar (multipart/form-data) |

### Services
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/services` | Admin | Create a service with name, description, price |
| GET | `/api/services` | Any | Get all available services |
| DELETE | `/api/services/:id` | Admin | Delete a service |

### Service Requests
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/services/requests` | Client | Submit a service request with optional note |
| GET | `/api/services/requests` | Admin, Client | Get requests — client sees own only |
| PATCH | `/api/services/requests/:id/approve` | Admin | Approve request — auto-creates a project |
| PATCH | `/api/services/requests/:id/reject` | Admin | Reject request |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | All | Get projects — filtered by role automatically |
| GET | `/api/projects/:id` | All | Get single project — own only |
| PATCH | `/api/projects/:id` | Admin | Update project name or description |
| PATCH | `/api/projects/:id/assign` | Admin | Assign or unassign employees |
| PATCH | `/api/projects/:id/status` | Admin, Employee | Update project status |
| DELETE | `/api/projects/:id` | Admin | Delete project |

### Messages
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/messages/conversations` | Any | Get all conversations with last message + unread count |
| GET | `/api/messages/contacts` | Any | Get contactable users based on role |
| GET | `/api/messages/:userId` | Any | Get full thread — marks messages as read |
| POST | `/api/messages` | Any | Send a message |
| DELETE | `/api/messages/:messageId` | Any | Delete own message |
| DELETE | `/api/messages/conversation/:userId` | Any | Delete entire conversation |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Admin | Get total counts — users, services, requests, projects |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments` | Admin | Create payment record for a project |
| GET | `/api/payments` | Admin, Client | Get all payments — client sees own only |
| GET | `/api/payments/stats` | Admin | Get total revenue, pending, partial amounts |
| GET | `/api/payments/project/:projectId` | Admin, Client | Get payment for a specific project |
| PATCH | `/api/payments/:id` | Admin | Update payment record |
| DELETE | `/api/payments/:id` | Admin | Delete payment record |

---

## Deployment

The backend is deployed on **AWS EC2** and managed with **PM2** for process management, ensuring the server runs continuously 24/7 and automatically restarts on crashes or reboots.

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@souviktechagency.com | abcd |
| Employee | jake@souviktechagency.com | abcd |
| Client | dana@souviktechagency.com | abcd |

---