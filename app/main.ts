import * as net from "net";

const server = net.createServer((socket) => {
  // socket.write(Buffer.from(`HTTP/1.1 200 OK\r\n\r\n`));
  // socket.end();
  socket.on("data", (data) => {
    const request = data.toString();
    const requestLine = request.split("\r\n")[0];
    const [method, path] = requestLine.split(" ");

    let response;
    if (path.startsWith("/echo/")) {
      const echoString = path.slice(6);
      const contentLength = Buffer.byteLength(echoString);

      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contentLength}\r\n\r\n${echoString}`;
    } else if (path === "/") {
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    socket.write(response, () => {
      socket.end();
    });
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
