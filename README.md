[![progress-banner](https://backend.codecrafters.io/progress/http-server/65f112aa-ef11-432e-b4da-daac10737c53)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

#  HTTP Server – TypeScript

A lightweight, custom-built HTTP server implemented in TypeScript using raw TCP sockets (`net` module). Built as part of the [Codecrafters HTTP Server challenge](https://app.codecrafters.io/) to deeply understand the internals of how HTTP servers function — from parsing headers to serving files and supporting gzip compression.

## 🚀 Features Implemented

### ✅ Basic HTTP Support
- Accepts TCP connections on `localhost:4221`
- Parses incoming HTTP GET and POST requests
- Handles and responds with proper HTTP status codes

### ✅ Route Handlers
#### `/`
- Responds with a simple `200 OK` for health check

#### `/echo/:string`
- Echoes back the string in the URL
- Supports gzip compression if requested via the `Accept-Encoding: gzip` header
- Responds with `Content-Encoding: gzip` and compressed body if applicable

#### `/user-agent`
- Returns the `User-Agent` string sent by the client

#### `/files/:filename`
- Handles file I/O for a given directory passed via `--directory`
- **GET**: Returns file content if it exists
- **POST**: Creates/overwrites the file with request body content

### ✅ Gzip Compression Support
- Checks the `Accept-Encoding` header for `gzip`
- Compresses the response body using `zlib.gzipSync`
- Adds appropriate `Content-Encoding` and `Content-Length` headers

### ✅ Header Parsing
- Extracts request method, path, and headers from raw HTTP request
- Handles both simple and multi-header formats

## 🧪 How to Test

### Run the Server
```bash
pnpm dev --directory ./data
```

## 🧪 Example Requests

### 🔁 Echo with Gzip
```bash
curl -H "Accept-Encoding: gzip" http://localhost:4221/echo/abc --output - | xxd
```

###🧾 User-Agent
```bash
curl -H "User-Agent: CodecraftersTest" http://localhost:4221/user-agent
```
###📂 File I/O
```bash
# Create a file
curl -X POST --data "Hello Codecrafters" http://localhost:4221/files/test.txt

# Read the file
curl http://localhost:4221/files/test.txt
```
### 🧰 Tech Stack
- Node.js – for runtime
- TypeScript – for strong typing
- net module – for raw TCP connections
- zlib module – for gzip compression
- fs/path modules – for file handling

### 👨‍💻 Author
Created with 💻 by Venkatesh Pandrinki

