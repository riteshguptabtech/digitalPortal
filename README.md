# Electricity Billing MERN App

A MERN stack electricity billing demo with React, Express, Node, and MongoDB Atlas. Users can log in, deposit wallet money, submit electricity bill requests, and track approval status. Admins can approve or reject requests; approved bills deduct from the user's wallet in MongoDB.

## Stack

- React + Vite + Tailwind CSS
- Express API
- MongoDB Atlas through the official `mongodb` driver
- Render Web Service + MongoDB Atlas

## Demo Credentials

- User: `user` / `user123`
- Admin: `admin` / `admin123`

## Local Setup

Create a MongoDB Atlas cluster, then copy `.env.example` to `.env` and set:

```bash
MONGODB_URI=mongodb+srv://user:password@cluster0.example.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=electricity_billing
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Install dependencies and seed the database:

```bash
npm install
npm run db:setup
npm run dev
```

`npm run dev` starts both the Express API on `http://localhost:5000` and the Vite client on `http://localhost:5173`. Vite proxies `/api` requests to Express.

## Production

```bash
npm run build
npm start
```

In production, Express serves the built React app from `dist` and exposes the API under `/api`.

## Deploy On Render

This repo includes a `render.yaml` Blueprint with one Node Web Service. Add these environment variables in Render:

- `MONGODB_URI`: your MongoDB Atlas connection string
- `MONGODB_DB_NAME`: `electricity_billing`

To deploy:

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Render, choose **New > Blueprint**.
3. Connect the repository.
4. Set `MONGODB_URI` when Render asks for the synced secret value.
5. Render will run `npm ci && npm run build`, then start the app with `npm start`.

The API initializes MongoDB collections, indexes, and seed data on startup.
