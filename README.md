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
   
## Real-time Database Functionality

This application uses Firebase Realtime Database to store and synchronize drawing data across all connected clients. Here's how it works:

1. **Data Structure**: Each drawing action is stored as a separate entry in the database. The structure looks like this:

   ```json
   {
     "drawings": {
       "uniqueId1": {
         "x1": 100,
         "y1": 150,
         "x2": 120,
         "y2": 170,
         "color": "#FF0000",
         "size": 5
       },
       "uniqueId2": {
         // Another drawing action
       }
     }
   }
   ```

2. **Storing Data**: When a user draws on the canvas, the application sends the drawing data to the server, which then stores it in the Firebase database.

3. **Real-time Updates**: As soon as new drawing data is added to the database, Firebase pushes this update to all connected clients.

4. **Retrieving Data**: When a new user joins, the application fetches all existing drawing data from the database and renders it on their canvas.

5. **Clearing the Board**: When a user clears the board, all drawing data is removed from the database, and a 'clear' message is sent to all clients.

This real-time database setup ensures that all users see the same drawing state at all times, enabling true real-time collaboration.

## Tech Stack
- Node.js and Express for the server
- WebSocket (ws) for real-time communication
- Firebase Realtime Database for data persistence
- CSS3 for styling and responsiveness
