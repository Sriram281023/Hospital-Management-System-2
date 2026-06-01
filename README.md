# 🏥 CityCare Hospital Management System
### Full-Stack MERN Application

A complete, production-ready Hospital Management System built with **MongoDB · Express · React · Node.js**.

---

## 📁 Project Structure

```
hospital-mern/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login / Register / Me
│   │   ├── patientController.js   # Patient CRUD + stats
│   │   ├── doctorController.js    # Doctor CRUD
│   │   ├── appointmentController.js
│   │   └── billController.js      # Billing + revenue summary
│   ├── middleware/
│   │   └── auth.js                # JWT protect + role authorize
│   ├── models/
│   │   ├── User.js                # Auth (bcrypt + JWT)
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js         # Auto-populates patient & doctor
│   │   └── Bill.js                # Virtual total field
│   ├── routes/
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   └── bills.js
│   ├── seed.js                    # Seed DB with sample data
│   ├── server.js                  # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js           # Axios client + all API methods
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── UI.jsx         # Shared atoms (Card, Btn, Modal…)
    │   │   │   └── Sidebar.jsx
    │   │   └── modules/
    │   │       ├── Dashboard.jsx  # KPIs + Recharts
    │   │       ├── Patients.jsx   # Full CRUD table
    │   │       ├── Doctors.jsx    # Card grid CRUD
    │   │       ├── Appointments.jsx
    │   │       └── Billing.jsx    # Dynamic line items
    │   ├── context/
    │   │   └── AppContext.jsx     # Global state + API calls
    │   ├── pages/
    │   │   └── Login.jsx          # Role-based login
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js             # Proxies /api → :5000
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

---

### 1 — Clone / unzip the project

```bash
cd hospital-mern
```

---

### 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Then edit .env — set MONGO_URI and JWT_SECRET

# Seed the database with sample data
npm run seed

# Start the API server (dev mode with auto-reload)
npm run dev
# Server runs on: http://localhost:5000
```

---

### 3 — Frontend Setup

Open a **new terminal tab**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# App runs on: http://localhost:3000
```

---

### 4 — Open in Browser

Navigate to **http://localhost:3000** and log in with any demo account:

| Role    | Username  | Password   | Access Level                          |
|---------|-----------|------------|---------------------------------------|
| Admin   | `admin`   | `admin123` | Full access — all CRUD operations     |
| Doctor  | `doctor`  | `doc123`   | Manage patients & appointments        |
| Patient | `patient` | `pat123`   | View-only                             |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description         | Access  |
|--------|----------------------|---------------------|---------|
| POST   | `/api/auth/register` | Register new user   | Public  |
| POST   | `/api/auth/login`    | Login, returns JWT  | Public  |
| GET    | `/api/auth/me`       | Current user info   | Private |

### Patients
| Method | Endpoint                 | Description           | Access         |
|--------|--------------------------|-----------------------|----------------|
| GET    | `/api/patients`          | Get all (+ search)    | All logged in  |
| GET    | `/api/patients/:id`      | Get single patient    | All logged in  |
| POST   | `/api/patients`          | Create patient        | Admin / Doctor |
| PUT    | `/api/patients/:id`      | Update patient        | Admin / Doctor |
| DELETE | `/api/patients/:id`      | Delete patient        | Admin only     |
| GET    | `/api/patients/stats`    | Status breakdown      | All logged in  |

### Doctors
| Method | Endpoint            | Description     | Access     |
|--------|---------------------|-----------------|------------|
| GET    | `/api/doctors`      | Get all doctors | All        |
| POST   | `/api/doctors`      | Add doctor      | Admin only |
| PUT    | `/api/doctors/:id`  | Update doctor   | Admin only |
| DELETE | `/api/doctors/:id`  | Delete doctor   | Admin only |

### Appointments
| Method | Endpoint                    | Description              | Access         |
|--------|-----------------------------|--------------------------|----------------|
| GET    | `/api/appointments`         | Get all (filter by status)| All           |
| POST   | `/api/appointments`         | Schedule appointment     | Admin / Doctor |
| PUT    | `/api/appointments/:id`     | Update / change status   | Admin / Doctor |
| DELETE | `/api/appointments/:id`     | Delete                   | Admin / Doctor |
| GET    | `/api/appointments/stats`   | Stats by status & type   | All            |

### Bills
| Method | Endpoint           | Description          | Access     |
|--------|--------------------|----------------------|------------|
| GET    | `/api/bills`       | All bills            | All        |
| POST   | `/api/bills`       | Create bill          | Admin only |
| PUT    | `/api/bills/:id`   | Update / mark paid   | Admin only |
| DELETE | `/api/bills/:id`   | Delete bill          | Admin only |
| GET    | `/api/bills/summary` | Revenue summary    | All        |

---

## 🛠 Tech Stack

| Layer     | Technology                             |
|-----------|----------------------------------------|
| Database  | MongoDB + Mongoose ODM                 |
| Backend   | Node.js + Express.js                   |
| Auth      | JWT + bcryptjs                         |
| Frontend  | React 18 + Vite                        |
| HTTP      | Axios (with interceptors)              |
| Charts    | Recharts                               |
| State     | React Context API                      |
| Styling   | Inline styles (design token system)    |

---

## 🔐 Security Features

- **JWT Authentication** — tokens stored in localStorage, sent via `Authorization: Bearer` header
- **Role-Based Access Control** — Admin / Doctor / Patient permissions enforced on every route
- **Password Hashing** — bcrypt with salt rounds
- **Global 401 Interceptor** — auto-logout on expired token
- **Input Validation** — Mongoose schema-level validation

---

## 🗂 MongoDB Schemas

### Patient
```js
{ name, age, gender, phone, email, blood, condition, address,
  doctorId (ref: Doctor), status, since, notes }
```

### Doctor
```js
{ name, specialty, phone, email, exp, status, schedule, patients, userId }
```

### Appointment
```js
{ patientId (ref: Patient), doctorId (ref: Doctor),
  date, time, type, status, notes }
// Auto-populates patientId & doctorId on find
```

### Bill
```js
{ patientId (ref: Patient), date,
  items: [{ name, amt }],   // embedded sub-documents
  status, paidAt }
// Virtual: total = sum of items[].amt
```

---

## 📦 Build for Production

```bash
# Backend — no build needed, runs with Node
cd backend && npm start

# Frontend
cd frontend && npm run build
# Output: frontend/dist/  → serve with nginx or any static host
```

---

## 🌱 Environment Variables (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Deployment Tips

1. **MongoDB Atlas** — replace `MONGO_URI` with your Atlas connection string
2. **Render / Railway** — push backend, add env vars in dashboard
3. **Vercel / Netlify** — deploy `frontend/dist`, set `VITE_API_URL` env var
4. Update `vite.config.js` proxy target for staging/production

---

> Built with ❤️ for the CityCare Hospital Management System  
> MERN Stack · JWT Auth · Role-Based Access · Real-time MongoDB integration
