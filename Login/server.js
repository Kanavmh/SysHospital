const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 3000;
const dataFilePath = path.join(__dirname, 'users.json');

const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

const requestHandler = (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(path.join(__dirname, 'public/login.html'), (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const parsedData = querystring.parse(body);

      if (req.url === '/register') {
        const { username, password } = parsedData;
        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<script>alert("Username and password are required!"); window.history.back();</script>');
          return;
        }

        const users = readData();
        const userExists = users.some((user) => user.username === username);

        if (userExists) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<script>alert("User already exists!"); window.history.back();</script>');
          return;
        }

        users.push({ username, password });
        writeData(users);
        res.writeHead(201, { 'Content-Type': 'text/html' });
        res.end('<script>alert("User registered successfully!"); window.location.href="/";</script>');
      } else if (req.url === '/login') {
        const { username, password } = parsedData;
        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<script>alert("Username and password are required!"); window.history.back();</script>');
          return;
        }

        const users = readData();
        const user = users.find((user) => user.username === username && user.password === password);

        if (!user) {
          res.writeHead(401, { 'Content-Type': 'text/html' });
          res.end('<script>alert("Invalid credentials!"); window.history.back();</script>');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<script>alert("Login successful!"); window.location.href="/dashboard-doctor.html";</script>');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
