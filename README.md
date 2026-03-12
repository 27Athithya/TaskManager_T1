# 📱 Task Manager Mobile App

A modern, full-stack task management application built with React Native (Expo) and Node.js. Manage your tasks efficiently with due dates, time-based reminders, and a clean, intuitive interface.

## ✨ Features

### Task Management
- ✅ Create, read, update, and delete tasks
- 📅 Set due dates and specific due times
- 🔔 Push notifications and reminders when tasks are due
- ✨ Instant notifications when tasks are created
- 🎯 Mark tasks as complete or reopen them
- 😊 Full emoji support in task titles and descriptions

### User Experience
- 🎨 Professional, modern UI with clean color system
- 🎭 Custom SVG icon set for better visual appeal
- 📊 History view for completed and overdue tasks
- 📋 Generate and share task history reports
- 📱 Native mobile experience with Expo
- 🔄 Real-time updates across the application

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React Native (Expo SDK ~54.0.0)
- **Navigation:** React Navigation (Stack Navigator)
- **UI Components:** Custom components with React Native SVG
- **Date/Time Picker:** @react-native-community/datetimepicker
- **Notifications:** Expo Notifications
- **HTTP Client:** Axios
- **State Management:** React Hooks

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** SQLite
- **Middleware:** CORS, dotenv

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Expo CLI** (for mobile development)
- **iOS Simulator** (for Mac) or **Android Studio** (for Android development)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-manager-app
```

### 2. Backend Setup

```bash
cd server
npm install
npm start
```

The server will start on **http://localhost:3000**

**Development mode with auto-reload:**
```bash
npm run dev
```

### 3. Client Setup

```bash
cd client
npm install
npm start
```

This will open the Expo Developer Tools. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your physical device

## 📁 Project Structure

```
task-manager-app/
├── client/                 # React Native mobile app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── AppIcon.js
│   │   │   ├── InputField.js
│   │   │   └── TaskCard.js
│   │   ├── navigation/    # Navigation configuration
│   │   │   └── AppNavigator.js
│   │   ├── screens/       # App screens
│   │   │   ├── TaskListScreen.js
│   │   │   ├── TaskFormScreen.js
│   │   │   └── HistoryScreen.js
│   │   ├── services/      # API and notification services
│   │   │   ├── api.js
│   │   │   └── notificationService.js
│   │   ├── theme/         # Theme and styling
│   │   │   └── theme.js
│   │   └── utils/         # Utility functions
│   │       └── date.js
│   ├── App.js             # Entry point
│   ├── app.json           # Expo configuration
│   └── package.json
│
└── server/                # Express.js backend
    ├── src/
    │   ├── config/        # Configuration files
    │   │   └── db.js
    │   ├── controllers/   # Request handlers
    │   │   └── taskController.js
    │   ├── models/        # Database models
    │   │   └── Task.js
    │   └── routes/        # API routes
    │       └── tasks.js
    ├── app.js             # Server entry point
    └── package.json
```

## 🔌 API Endpoints

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks?status=active\|completed\|all` | List tasks by status |
| `GET` | `/api/tasks/history` | Get history (completed + overdue) |
| `GET` | `/api/tasks/history/report` | Get report payload for sharing |
| `GET` | `/api/tasks/:id` | Get a single task by ID |
| `PUT` | `/api/tasks/:id` | Update a task |
| `PATCH` | `/api/tasks/:id/complete` | Mark task as complete |
| `PATCH` | `/api/tasks/:id/reopen` | Reopen a completed task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Sample Request

**Create a Task:**
```bash
POST http://localhost:3000/api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "dueDate": "2026-03-15",
  "dueTime": "14:30"
}
```

## 🎯 Usage

1. **Create a Task:** Tap the '+' button on the main screen
2. **Set Due Date/Time:** Use the date and time pickers
3. **Receive Notifications:** Grant notification permissions when prompted
4. **Complete Tasks:** Swipe or tap to mark tasks as complete
5. **View History:** Check completed and overdue tasks in the History tab
6. **Share Reports:** Generate and share task completion reports

## 📱 Screens

- **Task List Screen:** View all active tasks
- **Task Form Screen:** Create and edit tasks
- **History Screen:** View completed and overdue tasks with report generation

## 🛠️ Configuration

### Server Configuration

Create a `.env` file in the `server/` directory (optional):

```env
PORT=3000
DATABASE_PATH=./database.sqlite
```

### Client Configuration

Update the API base URL in `client/src/services/api.js` if your server runs on a different port or host.

## 🐛 Troubleshooting

### Common Issues

**Issue:** Server won't start
- **Solution:** Make sure port 3000 is not in use. Change the port in `server/app.js` if needed.

**Issue:** Client can't connect to server
- **Solution:** Update the API URL in `client/src/services/api.js` to match your server's IP address (not localhost when using a physical device).

**Issue:** Notifications not working
- **Solution:** Ensure you've granted notification permissions and are testing on a physical device (push notifications don't work in simulators).

**Issue:** Typo in command - "nmp start" instead of "npm start"
- **Solution:** Use `npm start` (not "nmp start")

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons powered by React Native SVG
- Database management with [Sequelize](https://sequelize.org/)

---

**Happy Task Managing! 🎉**

## Notes

- Android local emulator uses `10.0.2.2` as API host.
- iOS simulator and web use `localhost`.
- For physical devices, update the API base URL in `client/src/services/api.js` to your machine IP.
