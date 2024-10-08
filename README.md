# SketchSync
Real-time collaborative drawing board built with Node.js, Express, WebSockets, and Firebase Realtime Database.

## Features

- Real-time drawing collaboration
- Color picker and palette
- Adjustable brush sizes
- Eraser tool
- Clear board functionality
- Responsive design


## Setup

### 1. Clone the repository
  ```bash
  git clone https://github.com/SK108045/SketchSync.git
  cd SketchSync
  ```
### 2.Install dependencies
  ```bash
  npm install
  ```

### 3.Firebase Configuration

- Create a Firebase project at https://console.firebase.google.com/
- Generate a new private key in Project Settings > Service Accounts
- Save the JSON file as ```service-account-key.json``` in the project root
= Update Firebase settings
- In server.js, replace the databaseURL with your Firebase project's database URL

### 4.Launch the server
  ```bash
  node server.js
  ```
- Open your browser and visit http://localhost:3000
   
## Tech Stack
- Node.js and Express for the server
- WebSocket (ws) for real-time communication
- Firebase Realtime Database for data persistence
- CSS3 for styling and responsiveness
