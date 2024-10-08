const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 3000;

// Initialize Firebase Admin SDK with your service account
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://test-3a5ee-default-rtdb.europe-west1.firebasedatabase.app" // Replace with your database URL
});

const db = admin.database();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    db.ref('drawings').push(data);
    // Broadcast the drawing data to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});

// Endpoint to get all drawings
app.get('/api/drawings', (req, res) => {
  db.ref('drawings').once('value', (snapshot) => {
    res.json(snapshot.val());
  });
});

// Endpoint to clear all drawings
app.delete('/api/drawings', (req, res) => {
  db.ref('drawings').remove((error) => {
    if (error) {
      res.status(500).send('Error clearing drawings');
    } else {
      res.status(200).send('Drawings cleared successfully');
      // Broadcast clear message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'clear' }));
        }
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
