import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const lines = request.split("\r\n"); // Split request into lines
    const requestLine = lines[0]; // First line contains method and path
    const [method, path] = requestLine.split(" ");

    let response;

    if (path.startsWith("/echo/")) {
      const echoString = path.slice(6); // Extract string after "/echo/"
      const contentLength = Buffer.byteLength(echoString);

      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contentLength}\r\n\r\n${echoString}`;
    } else if (path === "/user-agent") {
      // Find the User-Agent header
      const userAgentHeader = lines.find((line) => line.startsWith("User-Agent:"));
      const userAgent = userAgentHeader ? userAgentHeader.split(": ")[1] : "Unknown";
      const contentLength = Buffer.byteLength(userAgent);

      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contentLength}\r\n\r\n${userAgent}`;
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
