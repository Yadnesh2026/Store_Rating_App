# Store Rating App

A full-stack role-based web application that enables users to discover, rate, and manage stores through secure authentication and interactive dashboards. Built as part of a FullStack Intern Coding Challenge with a focus on scalable backend architecture, authentication, validation, and clean UI design.

---

## Live Demo

https://store-rating-app-swart.vercel.app/

---

## GitHub Repository

https://github.com/Yadnesh2026/Store_Rating_App

---

# Features

## Authentication & Security

- JWT-based authentication
- Secure password hashing using bcryptjs
- Role-based access control
- Protected API routes
- Persistent login sessions
- Logout functionality

---

# User Roles & Functionalities

## System Administrator

### Dashboard Features

- View total users
- View total stores
- View total ratings

### User Management

- Add new users with role assignment
- View all registered users
- Search and filter users
- Sort users by:
  - Name
  - Email
  - Address
  - Role

### Store Management

- Add new stores
- View all stores
- Search and filter stores
- Sort stores by:
  - Name
  - Email
  - Address
  - Rating

---

## Normal User

- User registration and login
- Update account password
- Browse all registered stores
- Search stores by name or address
- Submit ratings between 1–5
- Modify existing ratings
- View:
  - Overall store rating
  - Personal submitted rating

---

## Store Owner

- Secure login access
- Update password
- View average rating of assigned store
- View users who rated the store

---

# Tech Stack

## Frontend

- React.js
- Vite
- CSS

## Backend

- Node.js
- Express.js

## Database

- MySQL

## Authentication & Validation

- JWT (JSON Web Tokens)
- bcryptjs
- Zod

---

# Form Validation Rules

| Field | Validation |
|---|---|
| Name | Minimum 20 characters, Maximum 60 characters |
| Address | Maximum 400 characters |
| Password | 8–16 characters, at least one uppercase letter and one special character |
| Email | Standard email validation |
| Rating | Value between 1 and 5 |

---

# Project Structure

```text
Store_Rating_App/
│
├── client/               # React + Vite frontend
├── server/               # Express backend API
├── database/             # MySQL schema and seed files
├── package.json
└── README.md
