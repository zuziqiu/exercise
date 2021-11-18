var socket = io.connect('http://127.0.0.1:8080')

// Connection opened
socket.addEventListener('open', function (event) {
    socket.emit('receive', 'open');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});

document.body.addEventListener('click', function() {
  socket.emit('receive', 'click');
})