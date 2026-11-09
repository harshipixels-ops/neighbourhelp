# NeighbourHelp

**NeighbourHelp** is a friendly neighbourhood assistance platform. It connects people who need a small hand with everyday tasks (like carrying heavy groceries, yard chores, elderly assistance, or minor household errands) with kind volunteers living right in their local community.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ODM

---

## 📥 Installation

Clone the repository and install dependencies in the project folders:

### 1. Install root dependencies
```bash
npm install
```

### 2. Install client dependencies
```bash
cd client
npm install
cd ..
```

### 3. Install server dependencies
```bash
cd server
npm install
cd ..
```

---

## ⚙️ Environment Configuration

1. In the `server` folder, make a copy of `.env.example` and name it `.env`:
   ```bash
   # On Windows (PowerShell):
   copy server/.env.example server/.env

   # On Mac / Linux:
   cp server/.env.example server/.env
   ```

2. Open `server/.env` in your code editor and fill in your details:
   ```env
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=any-long-random-text
   NODE_ENV=development
   ```
   Replace `your-mongodb-connection-string` with your own MongoDB Atlas or local MongoDB link.

---

## 🚀 Running the Project

Run both the backend server and frontend client together with a single command from the main folder:

```bash
npm run dev
```

- **Frontend App:** Opens at `http://localhost:5173`
- **Backend API:** Runs at `http://localhost:5000`

---

## 👥 Demo Logins

The application automatically seeds sample accounts for immediate testing. You can use these or click the 1-click login buttons on the login page:

| Persona | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | Requester (Has active help requests) | `sarah@example.com` | `password123` |
| **Marcus Vance** | Volunteer (Ready to help) | `marcus@example.com` | `password123` |
| **Eleanor Rigby** | Senior Resident | `eleanor@example.com` | `password123` |
| **David Chen** | Community Member | `david@example.com` | `password123` |
| **Community Admin**| Moderator (Accesses Admin panel) | `admin@neighbourhelp.org` | `admin123` |

> ⚠️ **Security Notice:** These sample demo accounts and passwords are for local development and testing only. They must be changed, secured, or removed before deploying the application online to production.

---

## 🔒 Safety & Privacy

- NeighbourHelp is strictly for routine, non-emergency tasks. In case of an emergency, always contact local emergency services (911 / 112 / 999).
- Contact information and private directions remain hidden until a volunteer is approved by the requester.
