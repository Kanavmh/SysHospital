const express = require("express");
const path = require("path");
const fs = require("fs");
const apiRoutes = require('./api/apiRoutes');
const errorHandler = require('./middlewares/ErrorHandler');
const loggerMiddleware = require('./middlewares/Logger');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const {getUser} = require('./middlewares/getUser');
const cookieParser = require('cookie-parser');



const app = express();
const PORT = process.env.PORT || 8080;
app.use(cookieParser());
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "images"))); // Serve images

//ejs setup
app.set('view engine', "ejs");

// Serve pages
app.get("/", getUser, (req, res) => res.status(200).render("index", {name:req.user?.username}));
app.get("/signup", (req, res) => res.status(200).render("signup"));
app.get("/login", (req, res) => res.status(200).render("login"));
app.get("/aboutus", (req, res) => res.status(200).render("aboutus"));
app.get("/bookappointment", (req, res) => res.status(200).render("bookappointment"));
app.get("/dashborddoctor", (req, res) => res.status(200).render("dashborddoctor"));
app.get("/dashbordpatient", (req, res) => res.status(200).render("dashbordpatient"));



app.use('/api', apiRoutes); // API Routes

app.use(errorHandler); // Error Handler Middleware
app.use(loggerMiddleware); // Logger Middleware
app.use(helmet()); // Helmet Middleware
app.use(cors()); // Cors Middleware
app.use(morgan('tiny')); // Morgan Middleware

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)); 
