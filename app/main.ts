import * as net from "net";

const server = net.createServer((socket) => {
  socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
  socket.end();
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
