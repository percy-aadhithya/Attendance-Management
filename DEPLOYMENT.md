# Deployment Guide for Render.com

Currently, your application is configured to use **SQLite** (a local file database). For a production deployment on Render, you have two options:

## Option 1: SQLite (Quickest, for Demos)
**Use this if you just want to see the app running online quickly.**

1.  **DATABASE_URL**: Set the environment variable on Render to:
    ```
    file:./dev.db
    ```
2.  **Warning**: On Render's free tier (configured as a Web Service), the file system is *ephemeral*. This means **all your data (students, attendance) will be deleted** every time you redeploy or if the server restarts.
3.  **Persistence**: To prevent data loss with SQLite, you must add a [Disk](https://docs.render.com/disks) to your Render service (requires a paid plan) and point the database path there.

## Option 2: PostgreSQL (Recommended for Production)
**Use this for a real app where data must be safe.**

1.  **Create Database**:
    *   Go to the Render Dashboard.
    *   Click **New +** -> **PostgreSQL**.
    *   Name it (e.g., `academy-db`) and create it.
2.  **Get Connection String**:
    *   Once created, copy the **Internal Database URL** (if deploying the web app within Render) or **External Database URL** (if accessing from outside). It looks like: `postgres://user:password@hostname/dbname`.
3.  **Update Your Code**:
    *   You must change `prisma/schema.prisma`:
        ```diff
        - provider = "sqlite"
        + provider = "postgresql"
        ```
    *   Commit and push this change.
4.  **Environment Variable**:
    *   In your Web Service settings on Render, set `DATABASE_URL` to the connection string you copied.

## build Command
Use the following build command in Render:
```bash
npm install && npx prisma generate && npm run build
```

## Start Command
```bash
npm start
```
