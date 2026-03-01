# 🔐 Auth System — MongoDB

A backend authentication REST API built with **Node.js**, **Express 5**, and **MongoDB**.

## ✨ Features

- User registration with email verification (Nodemailer + Mailtrap)
- JWT-based login (httpOnly cookie)
- Forgot & reset password (time-limited token)
- Protected routes with auth middleware
- Password hashing (bcrypt pre-save hook)
- Role-based user model (`user` / `admin`)

## 🛠️ Tech Stack

Node.js · Express 5 · MongoDB · Mongoose · JWT · bcrypt · Nodemailer · Nodemon

## 📁 Project Structure

```
├── controller/User.controller.js   # Auth logic (register, login, verify, reset…)
├── middleware/auth.middleware.js    # JWT route protection
├── model/User.model.js             # Mongoose schema + bcrypt hook
├── routes/User.routes.js           # Route definitions
├── utils/db.js                     # MongoDB connection
└── index.js                        # Entry point
```

## ⚙️ Setup

```bash
git clone https://github.com/Shreya-Wani/auth-system-mongodb.git
cd auth-system-mongodb
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret
BASE_URL=http://localhost:3000
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=your_username
MAILTRAP_PASSWORD=your_password
MAILTRAP_SENDERMAIL=noreply@example.com
```

Start the server:

```bash
npm run dev
```

## 📡 API Endpoints

Base: `/api/v1/users`

| Method | Endpoint               | Auth | Description                |
| ------ | ---------------------- | ---- | -------------------------- |
| POST   | `/register`            | ✗    | Register a new user        |
| GET    | `/verify/:token`       | ✗    | Verify email               |
| POST   | `/resend-verification` | ✗    | Resend verification email  |
| POST   | `/login`               | ✗    | Login (sets JWT cookie)    |
| POST   | `/forgot-password`     | ✗    | Send password reset email  |
| POST   | `/reset/:token`        | ✗    | Reset password             |
| GET    | `/profile`             | ✓    | Get current user           |
| GET    | `/logout`              | ✓    | Logout (clears cookie)     |

---

> Built with 💙 by [Shreya Wani](https://github.com/Shreya-Wani) — for learning, building, and growing as a developer.
