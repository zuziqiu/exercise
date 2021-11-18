const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {cors: true}); // cors 允许跨域
app.get('/', (req, res) => {
  res.send('hello')
});
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('receive', (msg) => {
    console.log('msg:', msg)
  })
});
server.listen(8080, '127.0.0.1', () => {
  console.log('listening on *:8080');
});