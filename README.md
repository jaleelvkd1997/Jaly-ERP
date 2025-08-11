Enterprise Resource Planning software.

Step 0 — Decide the tiny goal (MVP)
We will first build a very small ERP that does: login → add company → add products → make a sale → see invoice.
React (frontend) + Node.js (backend, e.g. Nest or Express) + PostgreSQL (database).

Step 0 — Install Node.js & npm
Go to the official site:
https://nodejs.org

 Add it to PATH manually
Press Windows Key → type Environment Variables → click "Edit the system environment variables".

In the System Properties window → click "Environment Variables…".

In System variables, find and click Path → click Edit.

Step 2 — Install Backend Basics + PostgreSQL
A) Install PostgreSQL
Download from the official site:
https://www.postgresql.org/download/windows/

Choose Windows → Download the latest PostgreSQL LTS (e.g., 16.x) installer from EDB.

Run installer:

Leave all components ticked (PostgreSQL Server, pgAdmin, Command Line Tools).

Set password for “postgres” user (remember this — we’ll use it in .env file).

Keep default port 5432.

Finish install.

Test installation:

Open pgAdmin (comes with PostgreSQL).

Connect using:

Username: postgres

Password: (the one you set)

Right-click Databases → Create → Database → Name: jaly_erp.

# Make main folder for your ERP
mkdir jaly-erp
cd jaly-erp

# Make backend folder
mkdir backend
cd backend
npm init -y  # makes package.json for Node.js

# Go back to main folder
cd ..

# Make frontend folder (React)
npx create-react-app frontend

jaly-erp/
   backend/      ← server (API) will live here
   frontend/     ← website (ERP UI) will live here

\



B) Install backend packages
Go to your backend folder and run:

cd backend

# Install core backend tools
npm install express pg dotenv bcrypt jsonwebtoken cors

# Install dev tool for auto restart
npm install -D nodemon

C) Create basic backend files
Inside backend/, make:

pgsql
Copy
Edit
backend/
  package.json
  server.js      ← entry point
  db.js          ← database connection
  .env           ← secrets (DB & JWT)

# Install dev tool for auto restart
npm install -D nodemon
