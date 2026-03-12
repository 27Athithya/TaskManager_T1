# Task Manager Mobile App

A full-stack task manager with React Native (Expo) + Express + SQLite.

## What is improved

- Professional redesigned UI with a cleaner color system
- Custom SVG icon set (`react-native-svg`)
- Due date + due time support (not only date)
- Notification permission flow + due-time reminders (`expo-notifications`)
- Instant notification when a task is created
- Task completion workflow
- History view for completed and overdue tasks
- History report generation and native share action
- Emoji-friendly task titles and descriptions

## Stack

- Client: Expo, React Native, React Navigation, Axios, DateTimePicker, Expo Notifications, React Native SVG
- Server: Node.js, Express, Sequelize, SQLite

## Run the backend

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3000`.

## Run the client

```bash
cd client
npm install
npm start
```

## API endpoints

- `POST /api/tasks` create task
- `GET /api/tasks?status=active|completed|all` list tasks by status
- `GET /api/tasks/history` history list (completed + overdue)
- `GET /api/tasks/history/report` report payload
- `GET /api/tasks/:id` single task
- `PUT /api/tasks/:id` update task
- `PATCH /api/tasks/:id/complete` mark complete
- `PATCH /api/tasks/:id/reopen` reopen task
- `DELETE /api/tasks/:id` delete task

## Notes

- Android local emulator uses `10.0.2.2` as API host.
- iOS simulator and web use `localhost`.
- For physical devices, update the API base URL in `client/src/services/api.js` to your machine IP.
