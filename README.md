# TaskFlow

A fullstack collaborative project management web application.

## Project Structure

```
taskflow/
├── docker-compose.yml       # Orchestrates all services
├── .gitignore
├── README.md
├── backend/                 # Express.js REST API
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── config/db.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── validate.js      # Field/enum validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js       # Cascade deletes tasks on removal
│   │   ├── Task.js          # Enum priority/status, assignedTo ref
│   │   ├── Activity.js      # Activity log per project
│   │   └── Notification.js
│   └── routes/
│       ├── auth.js
│       ├── projects.js
│       ├── tasks.js
│       ├── members.js
│       ├── dashboard.js
│       ├── activities.js
│       └── notifications.js
└── frontend/                # Vanilla JS — no framework
    ├── Dockerfile
    ├── index.html           # Login / Register
    ├── dashboard.html
    ├── projects.html
    ├── project.html         # Project detail + tasks
    ├── css/style.css
    └── js/
        ├── api.js           # Axios instance with auth header
        ├── auth.js          # Auth flow + session restore
        ├── dashboard.js
        ├── projects.js
        ├── tasks.js         # Tasks CRUD + filter + draft auto-save
        ├── members.js
        └── notifications.js # Polling + badge + localStorage archive
```

## How to Run

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. Copy the env template and fill in values:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env`:
   ```
   MONGO_URI=mongodb://admin:secret@mongo:27017/taskflow?authSource=admin
   JWT_SECRET=your_super_secret_key_here
   PORT=5000
   ```
   Also create a root `.env` for docker-compose:
   ```
   MONGO_USER=admin
   MONGO_PASSWORD=secret
   ```

2. Start everything:
   ```bash
   docker-compose up --build
   ```

3. Open the app:
   - Frontend: http://localhost:8080
   - API: http://localhost:5000/api

### Stop
```bash
docker-compose down
```
To also remove database data:
```bash
docker-compose down -v
```

## Technical Choices

| Choice | Reason |
|--------|--------|
| **Express.js** | Minimal, flexible Node.js framework for REST APIs |
| **Mongoose** | ODM for MongoDB — schema validation, middleware hooks (cascade delete), populate |
| **bcryptjs** | Password hashing with 10 salt rounds — no native dependencies |
| **jsonwebtoken** | Stateless JWT auth — scalable, no server-side session storage |
| **Vanilla JS + Axios** | No framework overhead; Axios provides clean promise-based HTTP with interceptors |
| **MongoDB** | Document model fits project/task/member relationships naturally |
| **Docker + Docker Compose** | Reproducible environment; MongoDB isolated in container as required |
| **nginx** | Lightweight static file server for the frontend |
| **Mongoose pre('deleteOne')** | Cascade delete tasks when project is removed — enforced at model level |
| **MongoDB aggregation** | Dashboard metrics ($match/$group/$count) computed server-side for efficiency |
| **localStorage** | JWT token persistence + notification archive + task draft auto-save |
| **setInterval polling** | Simple notification refresh every 30s without WebSocket complexity |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/projects | List projects (paginated) |
| POST | /api/projects | Create project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project + cascade tasks |
| GET | /api/projects/:id/tasks | List tasks for project |
| GET | /api/projects/:id/activities | Activity feed |
| POST | /api/projects/:id/members | Invite member by email |
| DELETE | /api/projects/:id/members/:userId | Remove member |
| GET | /api/tasks | List tasks (filter/search/paginate) |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PATCH | /api/tasks/:id/status | Update task status only |
| GET | /api/dashboard | Personal dashboard metrics |
| GET | /api/notifications | List notifications |
| PATCH | /api/notifications/:id/read | Mark notification as read |
