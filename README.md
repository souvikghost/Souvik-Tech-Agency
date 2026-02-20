# Souvik Tech Agency — Backend API

REST API for a role-based company management portal. Built with Node.js, Express, and MongoDB.

## Live API

> https://your-render-url.onrender.com

---

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** authentication via httpOnly Cookie
- **bcrypt** for password hashing

---

## Project Structure

```
src/
├── config/
│   └── db.js
├── controllers/
│   ├── auth.js
│   ├── user.js
│   ├── service.js
│   ├── serviceRequest.js
│   ├── project.js
│   └── dashboard.js
├── middleware/
│   ├── protect.js
│   └── allowRoles.js
├── models/
│   ├── userModel.js
│   ├── projectModel.js
│   ├── serviceModel.js
│   ├── serviceRequestModel.js
│   └── messageModel.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── serviceRoutes.js
│   ├── projectRoutes.js
│   └── dashboardRoutes.js
├── index.js
└── server.js
```

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/souvik-tech-agency-backend.git
cd souvik-tech-agency-backend
npm install
```

### 2. Environment variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/souvik-tech-agency
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run

```bash
npm run dev
```

Server starts at `http://localhost:5000`

---

## Admin Setup

No self-registration. Admin is created manually in MongoDB.

**Step 1** — Hash your password:
```js
const bcrypt = require('bcrypt');
bcrypt.hash('yourpassword', 10).then(console.log);
```

**Step 2** — Insert into MongoDB:
```json
{
  "name": "Souvik Admin",
  "email": "admin@souviktechagency.com",
  "password": "<bcrypt_hash>",
  "role": "admin"
}
```

---

## API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Any |
| GET | `/api/auth/me` | Any |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/users` | Admin |
| GET | `/api/users?role=` | Admin |
| GET | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |
| PATCH | `/api/users/profile` | Any |

### Services
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/services` | Admin |
| GET | `/api/services` | Any |
| DELETE | `/api/services/:id` | Admin |
| POST | `/api/services/requests` | Client |
| GET | `/api/services/requests` | Admin, Client |
| PATCH | `/api/services/requests/:id/approve` | Admin |
| PATCH | `/api/services/requests/:id/reject` | Admin |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | All (filtered by role) |
| GET | `/api/projects/:id` | All (own only) |
| PATCH | `/api/projects/:id` | Admin |
| PATCH | `/api/projects/:id/assign` | Admin |
| PATCH | `/api/projects/:id/status` | Admin, Employee |
| DELETE | `/api/projects/:id` | Admin |

### Dashboard
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/dashboard` | Admin |

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@souviktechagency.com | Admin@1234 |
| Employee | employee@souviktechagency.com | Employee@123 |
| Client | client@souviktechagency.com | Client@123 |

---

## Author

**Souvik Ghosh** — Assessment for Manaagenda Pvt. Ltd.