# YIZ-AMS Backend

Backend API for the Ya Isa Zama Association Management System (YIZ-AMS).

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT (Coming in Sprint 5)
- bcrypt (Coming in Sprint 5)

## Features

- Member Management (CRUD)
- Request Validation
- Global Error Handling
- Standardized API Responses
- PostgreSQL Database
- Prisma ORM

## Project Structure

```
src/
│
├── config/
├── constants/
├── controllers/
├── docs/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
└── index.js
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file.

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/yiz_ams"
PORT=5000
```

## Run Development Server

```bash
npm run dev
```

## API Endpoints

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/members | Get all members |
| GET | /api/members/:id | Get member by ID |
| POST | /api/members | Create member |
| PUT | /api/members/:id | Update member |
| DELETE | /api/members/:id | Delete member |

## Status

Current Progress:

- Sprint 1 ✅
- Sprint 2 ✅
- Sprint 3 ✅
- Sprint 4 ✅
- Sprint 4.5 ✅
- Sprint 5 ⏳ Authentication