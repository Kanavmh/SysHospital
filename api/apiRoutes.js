
const express = require('express'); 
const router = express.Router(); 
const path = require('path');
const usersFile = path.join(__dirname, "../models/users.json");  
const fs = require('fs');

router.post("/signup", (req, res) => {
    const { username, password } = req.body;  
  
    if (!username || !password) {
      return res.redirect("/signup"); // Redirect back if fields are empty
    }
  
    let users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, "utf8")) : []; 
  
    // Check if user already exists
    if (users.find((user) => user.username === username)) {
      return res.redirect("/login"); // Redirect to login if user exists
    }
  
    // Add new user and save to file
    users.push({ username, password });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  
    res
    .cookie('user', { username })
    .redirect("/"); // Redirect to welcome page
  });
  
  // Handle Login
  router.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(302).redirect("/signup");
    }
  
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  
      if (users.find((user) => user.username === username && user.password === password)) {
        return res.status(302)
        .cookie('user', {username})
        .redirect("/"); // Redirect to welcome if login successful
      }
    2
  
    res.redirect("/signup"); // Redirect to signup if login fails
  }
  });
  module.exports = router;
  