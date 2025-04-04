import * as net from "net";
import * as fs from "fs";
import * as path from "path";

// Get directory from command-line args
const args = process.argv;
const directoryIndex = args.indexOf("--directory");
const directory = directoryIndex !== -1 ? args[directoryIndex + 1] : null;

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const lines = request.split("\r\n");
    const requestLine = lines[0];
    const [method, pathUrl] = requestLine.split(" ");

    let response;

    if (pathUrl === "/") {
      // ✅ Root endpoint
      response = "HTTP/1.1 200 OK\r\n\r\n";
    } else if (pathUrl.startsWith("/echo/")) {
      // ✅ `/echo/{str}`
      const echoString = pathUrl.slice(6);
      const contentLength = Buffer.byteLength(echoString);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contentLength}\r\n\r\n${echoString}`;
    } else if (pathUrl === "/user-agent") {
      // ✅ `/user-agent`
      const userAgentHeader = lines.find((line) => line.startsWith("User-Agent:"));
      const userAgent = userAgentHeader ? userAgentHeader.split(": ")[1] : "Unknown";
      const contentLength = Buffer.byteLength(userAgent);
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contentLength}\r\n\r\n${userAgent}`;
    } else if (pathUrl.startsWith("/files/")) {
      // ✅ `/files/{filename}`
      if (!directory) {
        response = "HTTP/1.1 500 Internal Server Error\r\n\r\n";
      } else {
        const filename = pathUrl.slice(7); // Extract filename
        const filePath = path.join(directory, filename);

        if (method === "GET") {
          // ✅ Handle GET (return file content)
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const fileContent = fs.readFileSync(filePath);
            const contentLength = fileContent.length;

            response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${contentLength}\r\n\r\n`;
            socket.write(response);
            socket.write(fileContent);
            socket.end();
            return;
          } else {
            response = "HTTP/1.1 404 Not Found\r\n\r\n";
          }
        } else if (method === "POST") {
          // ✅ Handle POST (write request body to file)
          const contentLengthHeader = lines.find((line) => line.startsWith("Content-Length:"));
          const contentLength = contentLengthHeader ? parseInt(contentLengthHeader.split(": ")[1]) : 0;

          // Extract request body (last part of data)
          const bodyStartIndex = request.indexOf("\r\n\r\n") + 4;
          const requestBody = request.slice(bodyStartIndex, bodyStartIndex + contentLength);

          // Write file
          fs.writeFileSync(filePath, requestBody);

          response = "HTTP/1.1 201 Created\r\n\r\n";
        }
      }
    } else {
      // ✅ Handle invalid paths with 404
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }

    socket.write(response || "", () => {
      socket.end();
    });
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
