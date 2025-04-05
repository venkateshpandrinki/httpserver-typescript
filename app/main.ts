import * as net from "net";
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";

const dirIndex = process.argv.indexOf("--directory");
const directory = dirIndex !== -1 ? process.argv[dirIndex + 1] : null;

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const [requestLine, ...headerLines] = request.split("\r\n");
    const [method, reqPath] = requestLine.split(" ");

    const headers: Record<string, string> = {};
    for (const line of headerLines) {
      if (line.includes(":")) {
        const [key, ...rest] = line.split(":");
        headers[key.trim().toLowerCase()] = rest.join(":").trim();
      }
    }

    const bodyIndex = request.indexOf("\r\n\r\n");
    const body = request.slice(bodyIndex + 4);

    let response = "";
    let sendBuffer: Buffer | null = null;

    if (reqPath === "/") {
      response = `HTTP/1.1 200 OK\r\n\r\n`;

    } else if (reqPath.startsWith("/echo/")) {
      const echoString = reqPath.slice(6);
      const acceptEncoding = headers["accept-encoding"];
      const shouldCompress = acceptEncoding?.includes("gzip");

      if (shouldCompress) {
        const compressed = zlib.gzipSync(echoString);
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${compressed.length}\r\n\r\n`;
        sendBuffer = compressed;
      } else {
        response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(echoString)}\r\n\r\n${echoString}`;
      }

    } else if (reqPath === "/user-agent") {
      const userAgent = headers["user-agent"] || "";
      response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(userAgent)}\r\n\r\n${userAgent}`;

    } else if (reqPath.startsWith("/files/") && directory) {
      const filename = reqPath.slice(7);
      const filepath = path.join(directory, filename);

      if (method === "GET") {
        if (fs.existsSync(filepath)) {
          const fileData = fs.readFileSync(filepath);
          response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileData.length}\r\n\r\n`;
          socket.write(response);
          socket.write(fileData);
          socket.end();
          return;
        } else {
          response = `HTTP/1.1 404 Not Found\r\n\r\n`;
        }
      } else if (method === "POST") {
        fs.writeFileSync(filepath, body);
        response = `HTTP/1.1 201 Created\r\n\r\n`;
      }

    } else {
      response = `HTTP/1.1 404 Not Found\r\n\r\n`;
    }

    socket.write(response, () => {
      if (sendBuffer) {
        socket.write(sendBuffer);
      }
      socket.end();
    });
  });

  socket.on("close", () => socket.end());
});

server.listen(4221, "localhost", () => {
  console.log("Server running on http://localhost:4221");
});
