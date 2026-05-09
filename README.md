# Store Rating Web Application

Full-stack intern coding challenge implementation using:

- Backend: Express.js
- Database: MySQL
- Frontend: React.js with Vite

## Features

- Single login system for System Administrator, Normal User, and Store Owner roles.
- Normal user signup, login, password update, store search, submit/modify ratings.
- Admin dashboard counts users, stores, and ratings.
- Admin can add users, admins, store owners, and stores.
- Admin can list/filter/sort users and stores.
- Store owner dashboard shows average rating and users who rated their store.
- Form validations match the assignment requirements.

## Setup

1. Create a MySQL database and import the schema:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

2. Configure backend environment:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MySQL username/password.

3. Install dependencies:

```bash
npm run install:all
```

4. Run the app:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Seed Logins

All seeded users use this password:

```text
Password@123
```

- Admin: `admin@storerating.test`
- Normal User: `user@storerating.test`
- Store Owner: `owner@storerating.test`

