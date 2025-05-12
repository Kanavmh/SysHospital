const express = require("express");
const path = require("path");
const fs = require("fs");
const apiRoutes = require('./api/apiRoutes');
const errorHandler = require('./middlewares/ErrorHandler');
const loggerMiddleware = require('./middlewares/Logger');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const User = require('./models/user'); 
const Appointment = require('./models/Appointment');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cookieParser());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "images"))); // Serve images

// EJS Setup
app.set('view engine', "ejs");

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medismin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware for body parsing
app.use(bodyParser.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/medismin' })
}));

// Authentication Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login'); // Changed from req.session.userId to req.session.user
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session.user.role !== role) return res.status(403).send("Forbidden");
    next();
  };
}

// Routes
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/aboutus', (req, res) => res.render('aboutus'));
app.get('/dashborddoctor', requireLogin, requireRole('doctor'), (req, res) => res.render('dashborddoctor'));
app.get('/dashbordpatient', requireLogin, requireRole('patient'), (req, res) => res.render('dashbordpatient'));

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.redirect('/signup');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/signup');
    req.session.user = user; // Store user in session

    if (user.role === 'doctor') {
      return res.redirect('/dashborddoctor');
    } else {
      return res.redirect('/dashbordpatient');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Ensure all fields are provided
  if (!username || !email || !password || !role) {
    return res.status(400).send('All fields are required.');
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists. Please choose another.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();
    req.session.user = newUser; // Set session

    // Redirect based on role
    if (role === 'doctor') {
      res.redirect('/dashborddoctor');
    } else if (role === 'patient') {
      res.redirect('/dashbordpatient');
    } else {
      res.status(400).send('Invalid role. Please choose "doctor" or "patient".');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Patient Dashboard Route (Ensure authentication)
app.get('/dashbordpatient', requireLogin, async (req, res) => {
  if (req.session.user.role !== 'patient') return res.redirect('/dashborddoctor');
  const myAppointments = await Appointment.find({ patient: req.session.user._id });
  res.render('dashbordpatient', { user: req.session.user, appointments: myAppointments });
});

// Book Appointment Route
app.get('/bookappointment', requireLogin, (req, res) => {
  if (req.session.user.role !== 'patient') return res.redirect('/dashborddoctor');
  res.render('bookappointment');
});

app.post('/bookappointment', requireLogin, async (req, res) => {
  const { doctor, date, time } = req.body;
  const newApp = new Appointment({
    patient: req.session.user._id,
    doctor, date, time
  });
  await newApp.save();
  res.redirect('/dashbordpatient');
});

const appointmentRoutes = require('./routes/appointment');

app.get('/', (req, res) => {
  res.render('bookappointment'); // EJS file for the appointment form
});

app.post('/book-appointment', async (req, res) => {
  const { patientName, doctorName, appointmentDate, reason } = req.body;

  const newAppointment = new Appointment({
    patientName,
    doctorName,
    appointmentDate,
    reason
  });

  try {
    await newAppointment.save();
    res.redirect('/dashbordpatient');
  } catch (err) {
    res.status(500).send('Error saving appointment');
  }
});

app.use((req, res, next) => {
  console.log("📥 POST Body:", req.body);
  next();
});

app.use('/api', apiRoutes); // API Routes
app.use(errorHandler); // Error Handler Middleware
app.use(loggerMiddleware); // Logger Middleware
app.use(helmet()); // Helmet Middleware
app.use(cors()); // CORS Middleware
app.use(morgan('tiny')); // Morgan Middleware

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
