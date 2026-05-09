# Store Rating App

A full-stack web application built for the FullStack Intern Coding Challenge. The platform allows users to rate registered stores from 1 to 5 and provides role-based dashboards for administrators, normal users, and store owners.

## Live Demo

```text
https://store-rating-app-swart.vercel.app/
```

## Repository

```text
https://github.com/Yadnesh2026/Store_Rating_App
```

## Tech Stack

- Frontend: React.js, Vite, CSS
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT, bcryptjs
- Validation: Zod

## Features

### Common

- Single login system for all roles
- Role-based dashboard after login
- Secure password hashing
- JWT-based protected API routes
- Logout functionality

### System Administrator

- View dashboard statistics:
  - Total users
  - Total stores
  - Total ratings
- Add new users with role selection
- Add new stores
- View user list with name, email, address, and role
- View store list with name, email, address, and rating
- Filter users and stores by key fields
- Sort listings by fields such as name, email, address, role, and rating

### Normal User

- Sign up and log in
- Update password
- View all registered stores
- Search stores by name or address
- Submit a rating from 1 to 5
- Modify previously submitted rating
- View overall rating and own submitted rating

### Store Owner

- Log in
- Update password
- View average rating for assigned store
- View users who submitted ratings for the store

## Form Validations

- Name: minimum 20 characters and maximum 60 characters
- Address: maximum 400 characters
- Password: 8 to 16 characters, at least one uppercase letter and one special character
- Email: standard email format validation
- Rating: number between 1 and 5

## Project Structure

```text
Store_Rating_App/
+-- client/              # React + Vite frontend
+-- server/              # Express backend API
+-- database/            # MySQL schema and seed files
+-- package.json         # Root scripts
+-- README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Yadnesh2026/Store_Rating_App.git
cd Store_Rating_App
```

### 2. Create the MySQL database

Open MySQL and run:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

### 3. Configure environment variables

Create a `.env` file inside the `server` folder:

```bash
cp server/.env.example server/.env
```

Update the values:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your-long-random-secret
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=store_rating_app
```

### 4. Install dependencies

```bash
npm run install:all
```

### 5. Run the application

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

## Seed Login Credentials

All seeded accounts use the same password:

```text
Password@123
```

| Role | Email |
| --- | --- |
| Admin | admin@storerating.test |
| Normal User | user@storerating.test |
| Store Owner | owner@storerating.test |

## Deployment

The frontend can be deployed on Vercel as a Vite app.

Frontend settings:

```text
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Frontend environment variable:

```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

Backend settings:

```text
Root Directory: server
Framework Preset: Other
Start Command: npm start
```

Backend environment variables:

```env
PORT=5000
CLIENT_ORIGIN=https://your-frontend-url.vercel.app
JWT_SECRET=your-long-random-secret
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=store_rating_app
```

Note: Vercel does not host MySQL directly. Use a hosted MySQL provider and import `database/schema.sql` followed by `database/seed.sql`.

## Build

To build the frontend:

```bash
npm run build
```

## Author

Yadnesh Vidulkar
