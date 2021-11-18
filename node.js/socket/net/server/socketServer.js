const net = require('net')

const server = net.createServer((socket) => {
  // socket.end('gooobye\n');
  socket.write('from server message', () => {

  })
  socket.on('data', (data) => {
    console.log('服务端收到信息', data.toString())
  })
})

server.on('error', (err) => {
  throw err;
})

server.listen(8124, () => {
  console.log('open server on', server.address())
})