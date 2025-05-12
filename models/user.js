const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String // 'doctor' or 'patient'
});

module.exports = mongoose.model('User', userSchema);
