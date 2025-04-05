import * as net from "net";
import * as fs from "fs";
import * as path from "path";

// Get the directory from the --directory flag
const directoryFlagIndex = process.argv.indexOf("--directory");
const directory = directoryFlagIndex !== -1 ? process.argv[directoryFlagIndex + 1] : "";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const [requestLine, ...headerLines] = request.split("\r\n");
    const [method, requestPath] = requestLine.split(" ");

    const headers: Record<string, string> = {};
    for (const line of headerLines) {
      const [key, value] = line.split(": ");
      if (key && value) {
        headers[key.toLowerCase()] = value.trim();
      }
    }

    const acceptEncoding = headers["accept-encoding"] || "";
    const shouldGzip = acceptEncoding.includes("gzip");

    let response = "";
    let responseBody: string | Buffer = "";
    let contentType = "text/plain";

    if (method === "GET" && requestPath.startsWith("/echo/")) {
      const echoString = requestPath.slice(6);
      responseBody = echoString;
    } else if (method === "GET" && requestPath === "/") {
      responseBody = "";
    } else if (method === "GET" && requestPath.startsWith("/files/")) {
      const filename = requestPath.replace("/files/", "");
      const filePath = path.join(directory, filename);
      if (fs.existsSync(filePath)) {
        responseBody = fs.readFileSync(filePath);
        contentType = "application/octet-stream";
      } else {
        response = `HTTP/1.1 404 Not Found\r\n\r\n`;
        socket.write(response);
        socket.end();
        return;
      }
    } else if (method === "POST" && requestPath.startsWith("/files/")) {
      const filename = requestPath.replace("/files/", "");
      const filePath = path.join(directory, filename);
      const contentLength = parseInt(headers["content-length"] || "0");
      const body = request.split("\r\n\r\n")[1]?.slice(0, contentLength);
      fs.writeFileSync(filePath, body);
      response = `HTTP/1.1 201 Created\r\n\r\n`;
      socket.write(response);
      socket.end();
      return;
    } else {
      response = `HTTP/1.1 404 Not Found\r\n\r\n`;
      socket.write(response);
      socket.end();
      return;
    }

    const bodyBuffer = typeof responseBody === "string" ? Buffer.from(responseBody, "utf-8") : responseBody;
    response += `HTTP/1.1 200 OK\r\n`;
    response += `Content-Type: ${contentType}\r\n`;
    response += `Content-Length: ${bodyBuffer.length}\r\n`;

    if (shouldGzip) {
      response += `Content-Encoding: gzip\r\n`;
    }

    response += `\r\n`;

    socket.write(response);
    socket.write(bodyBuffer);
    socket.end();
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server running on http://localhost:4221");
});
